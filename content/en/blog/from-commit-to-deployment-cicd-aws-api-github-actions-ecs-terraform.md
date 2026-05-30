---
title: From Commit to Deployment - CI/CD for an AWS API using GitHub Actions, ECS, and Terraform
description: Learn how to build a complete CI/CD pipeline for an API on AWS using GitHub Actions, ECS, and Terraform to automate deployments.
date: 2026-03-12
category: Cloud
tags:
  - devops
  - dotnet
  - tutorial
  - aws
readingTime: 12
---

## Introduction

Deploying an application to production goes far beyond writing code. It involves building, testing, packaging, and delivering software in a reliable and repeatable way.

In this article, I’ll show how to build a complete pipeline — from commit to deployment — using **GitHub Actions** for CI/CD, **Terraform** for Infrastructure as Code, and **AWS** (ECR, ECS Fargate) as the runtime platform.

The concept presented here is **language agnostic** — it works with any stack that runs inside a Docker container (Node.js, Go, Java, Python, etc.). For the practical examples, we’ll use **.NET** as a reference, but the workflows, Terraform infrastructure, and deployment flow remain the same regardless of the chosen technology.

The goal is to demonstrate how these tools connect together to create an automated workflow where a simple merge into the `main` branch results in a new version running in production without manual intervention.

---

## Prerequisites

Before getting started, you need the following tools installed and configured:

| Tool | Description | Installation Link |
|------|-------------|-------------------|
| **Docker** | To build and run containers | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |
| **Terraform** | To provision infrastructure as code | [developer.hashicorp.com/terraform/install](https://developer.hashicorp.com/terraform/install) |
| **AWS CLI** | To interact with AWS services via terminal | [docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) |
| **Git** | For source control | [git-scm.com/downloads](https://git-scm.com/downloads) |
| **AWS Account** | With permissions to create resources (IAM, ECS, ECR) | [aws.amazon.com/free](https://aws.amazon.com/free/) |
| **GitHub Account** | To host the repository and run workflows | [github.com](https://github.com/) |

> **Note:** For this article, you’ll also need the [.NET SDK](https://dotnet.microsoft.com/download) installed locally for development. If you are using another stack, replace it with the corresponding SDK (Node.js, Go, JDK, etc.). Another important point is that ECS was chosen instead of EKS or EC2 because of its simpler learning curve, lower management overhead, and reduced infrastructure costs for study purposes.

---

## Architecture Overview

The complete workflow looks like this:

```plaintext
Developer → Feature Branch → Pull Request → Validation (CI)
                                                  ↓
                                            Merge into main
                                                  ↓
                                          Build & Push (CD)
                                                  ↓
                                         Deploy to ECS Fargate
```

---

## Configuring IAM for Terraform

Before running any `terraform apply`, Terraform needs permissions to create AWS resources. To do this, we need an **IAM user** (or role) with the appropriate permissions and configure its credentials locally.

### Creating an IAM User for Terraform

In the AWS Console (IAM > Users), create a dedicated Terraform user:

1. Go to **IAM > Users > Create User**
2. Name the user (example: `terraform-deployer`)
3. Attach the required policies for the resources being created:

```plaintext
AmazonECS_FullAccess
AmazonEC2ContainerRegistryFullAccess
AmazonVPCReadOnlyAccess
IAMFullAccess
CloudWatchLogsFullAccess
AmazonS3FullAccess
```

> **Security note:** In production environments, the ideal approach is to create a **custom policy** following the principle of least privilege, granting only the strictly necessary permissions. For learning purposes, the managed policies above simplify the setup.

4. After creating the user, generate an **Access Key** (IAM > Users > Security credentials > Create access key)
5. Select the **Command Line Interface (CLI)** use case

### Configuring Local Credentials

With AWS CLI installed, configure your credentials:

```bash
aws configure
```

You’ll be prompted for:

```plaintext
AWS Access Key ID: AKIA...
AWS Secret Access Key: wJal...
Default region name: us-east-1
Default output format: json
```

This creates the `~/.aws/credentials` file that Terraform automatically uses through the AWS provider. Once this is done, Terraform is authorized to provision the resources we’ll define next.
````
