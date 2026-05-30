---
title: Del commit al despliegue - CI/CD de una API en AWS usando GitHub Actions, ECS y Terraform
description: Aprende a crear un pipeline completo de CI/CD para una API en AWS utilizando GitHub Actions, ECS y Terraform para automatizar despliegues.
date: 2026-03-12
category: Cloud
tags:
  - devops
  - dotnet
  - tutorial
  - aws
readingTime: 12
---

## Introducción

Llevar una aplicación a producción va mucho más allá de escribir código. Implica compilar, probar, empaquetar y entregar software de forma confiable y repetible.

En este artículo mostraré cómo construir un pipeline completo — desde el commit hasta el despliegue — utilizando **GitHub Actions** para CI/CD, **Terraform** para Infraestructura como Código y **AWS** (ECR, ECS Fargate) como plataforma de ejecución.

El concepto presentado aquí es **agnóstico al lenguaje** — funciona con cualquier stack que pueda ejecutarse dentro de un contenedor Docker (Node.js, Go, Java, Python, etc.). Para los ejemplos prácticos utilizaremos **.NET** como referencia, pero los workflows, la infraestructura Terraform y el flujo de despliegue son los mismos independientemente de la tecnología elegida.

El objetivo es demostrar cómo estas herramientas se conectan para formar un flujo automatizado donde un simple merge en la rama `main` resulta en una nueva versión ejecutándose en producción sin intervención manual.

---

## Requisitos Previos

Antes de comenzar, necesitas tener instaladas y configuradas las siguientes herramientas:

| Herramienta | Descripción | Enlace de instalación |
|-------------|-------------|------------------------|
| **Docker** | Para construir y ejecutar contenedores | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |
| **Terraform** | Para aprovisionar infraestructura como código | [developer.hashicorp.com/terraform/install](https://developer.hashicorp.com/terraform/install) |
| **AWS CLI** | Para interactuar con servicios AWS desde la terminal | [docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) |
| **Git** | Para control de versiones | [git-scm.com/downloads](https://git-scm.com/downloads) |
| **Cuenta AWS** | Con permisos para crear recursos (IAM, ECS, ECR) | [aws.amazon.com/free](https://aws.amazon.com/free/) |
| **Cuenta GitHub** | Para alojar el repositorio y ejecutar workflows | [github.com](https://github.com/) |

> **Nota:** Para este artículo también necesitas tener instalado localmente el [.NET SDK](https://dotnet.microsoft.com/download) para desarrollo. Si utilizas otro stack, reemplázalo por el SDK correspondiente (Node.js, Go, JDK, etc.). Otro punto importante es que ECS fue elegido en lugar de EKS o EC2 debido a su curva de aprendizaje más simple, menor administración y costos reducidos para fines educativos.

---

## Visión General de la Arquitectura

El flujo completo funciona así:

```plaintext
Developer → Feature Branch → Pull Request → Validación (CI)
                                                  ↓
                                             Merge en main
                                                  ↓
                                           Build & Push (CD)
                                                  ↓
                                         Deploy en ECS Fargate
```

---

## Configurando IAM para Terraform

Antes de ejecutar cualquier `terraform apply`, Terraform necesita permisos para crear recursos en AWS. Para ello, necesitamos un **usuario IAM** (o role) con los permisos adecuados y configurar sus credenciales localmente.

### Creando un Usuario IAM para Terraform

En la consola AWS (IAM > Users), crea un usuario dedicado para Terraform:

1. Ve a **IAM > Users > Create User**
2. Asigna un nombre al usuario (ejemplo: `terraform-deployer`)
3. Adjunta las policies necesarias para los recursos que serán creados:

```plaintext
AmazonECS_FullAccess
AmazonEC2ContainerRegistryFullAccess
AmazonVPCReadOnlyAccess
IAMFullAccess
CloudWatchLogsFullAccess
AmazonS3FullAccess
```

> **Nota de seguridad:** En entornos productivos, lo ideal es crear una **policy personalizada** siguiendo el principio de menor privilegio, otorgando únicamente los permisos estrictamente necesarios. Para fines educativos, las managed policies anteriores simplifican la configuración.

4. Después de crear el usuario, genera una **Access Key** (IAM > Users > Security credentials > Create access key)
5. Selecciona el caso de uso **Command Line Interface (CLI)**

### Configurando Credenciales Localmente

Con AWS CLI instalado, configura tus credenciales:

```bash
aws configure
```

Se solicitará:

```plaintext
AWS Access Key ID: AKIA...
AWS Secret Access Key: wJal...
Default region name: us-east-1
Default output format: json
```

Esto crea el archivo `~/.aws/credentials`, que Terraform utilizará automáticamente mediante el provider AWS. Una vez hecho esto, Terraform tendrá autorización para aprovisionar los recursos que definiremos a continuación.

---

## Infraestructura como Código con Terraform

Antes de que cualquier pipeline pueda ejecutarse, la infraestructura debe existir. Con Terraform declaramos todos los recursos AWS en archivos `.tf` y los aprovisionamos con un solo comando.

### Recursos Aprovisionados

```hcl
# Provider AWS
provider "aws" {
  region = "us-east-1"
}

# Repositorio ECR para almacenar imágenes Docker
resource "aws_ecr_repository" "app_repository" {
  name = "mi-app-repository"
}

# Cluster ECS
resource "aws_ecs_cluster" "app_cluster" {
  name = "mi-app-cluster"
}
```

### IAM Role para Tareas ECS

ECS necesita una role para descargar imágenes y enviar logs:

```hcl
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}
```

---

## Dockerfile Multi-Stage

Utilizamos un build multi-stage para separar el entorno de compilación del entorno de ejecución, resultando en una imagen final más pequeña y segura:

```dockerfile
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["MeuProjeto/MeuProjeto.csproj", "MeuProjeto/"]
RUN dotnet restore "MeuProjeto/MeuProjeto.csproj"
COPY . .
WORKDIR "/src/MeuProjeto"
RUN dotnet build -c Release -o /app/build
```

### Beneficios del Multi-Stage

- La imagen final contiene únicamente el runtime y no el SDK completo
- Reduce significativamente el tamaño de la imagen
- El código fuente no queda presente en la imagen de producción

---

## Pipeline de CI

El primer pipeline se ejecuta automáticamente cuando se abre un Pull Request contra la rama `main`. Su objetivo es validar que el código compile y que las pruebas pasen correctamente.

```yaml
name: PR Validation

on:
  pull_request:
    branches: [main]
```

### Qué sucede en este pipeline

1. **Job `build`** — Compila la solución para garantizar que no existan errores de compilación
2. **Job `test`** — Ejecuta pruebas unitarias con cobertura de código

Separar ambos jobs aporta claridad: si falla `build`, el problema es de compilación. Si falla `test`, el código compila pero existe un bug.

---

## Pipeline de CD

Cuando el Pull Request es aprobado y mergeado en `main`, entra en acción el pipeline de despliegue:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
```

### Qué sucede en este pipeline

1. **Autenticación OIDC** — GitHub intercambia un token JWT por credenciales temporales AWS
2. **Login en ECR** — Docker se autentica contra el registro AWS
3. **Build y Push** — Construye la imagen Docker y la envía al ECR
4. **Deploy** — ECS inicia un nuevo deployment reemplazando el contenedor anterior

---

## Seguridad: OIDC en Detalle

Vale la pena reforzar la importancia de OIDC dentro de este flujo.

### Modelo Tradicional

```plaintext
❌ GitHub Secrets → AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
- Credenciales estáticas que nunca expiran
- Si se filtran, el acceso permanece hasta rotarlas manualmente
```

### Modelo con OIDC

```plaintext
✅ GitHub Actions → JWT Token → AWS STS → Credenciales Temporales
- Credenciales expiran automáticamente
- Acceso restringido a una branch específica de un repositorio específico
- Sin secretos persistentes almacenados
```

---

## Flujo Completo: Del Commit al Despliegue

```shell
1. git checkout -b feature/mi-feature
2. # Desarrolla y realiza commits
3. git push origin feature/mi-feature
4. # Abre Pull Request → Ejecuta pr-validation.yml
   │
   ├── ✅ Build exitoso
   └── ✅ Tests exitosos
   │
5. # Code review + Aprobación
6. # Merge en main → Ejecuta build-and-deploy.yml
   │
   ├── 🔐 Autenticación vía OIDC
   ├── 🐳 Build de imagen Docker
   ├── 📦 Push al ECR
   └── 🚀 Deploy en ECS Fargate
   │
7. # Nueva versión ejecutándose en producción
```

---

## Consideraciones Finales

Este setup demuestra cómo es posible construir un pipeline profesional de CI/CD utilizando herramientas modernas y buenas prácticas:

- **Infraestructura como Código** — Toda la infraestructura es versionada y reproducible
- **Autenticación Keyless** — OIDC elimina el riesgo de credenciales estáticas
- **Containers Serverless** — Fargate elimina la necesidad de administrar servidores
- **Separación CI/CD** — Validación en PRs y despliegue únicamente desde `main`
- **Imágenes optimizadas** — Multi-stage reduce la superficie de ataque

El costo de infraestructura para un entorno como este es mínimo. Con Fargate utilizando 0.25 vCPU y 512MB de memoria, el costo suele mantenerse en pocos dólares mensuales para entornos educativos o pequeños proyectos.

La barrera de entrada para CI/CD profesional disminuyó mucho. Herramientas como GitHub Actions y Terraform hacen accesible lo que antes requería equipos DevOps dedicados. Lo importante es comenzar simple, entender cada pieza y evolucionar según la necesidad.

---

*Este artículo fue escrito basado en un proyecto práctico de estudio. Todo el código fuente está disponible públicamente en este repositorio de [GitHub](https://github.com/fernanduandrade/api-quality-lab).*