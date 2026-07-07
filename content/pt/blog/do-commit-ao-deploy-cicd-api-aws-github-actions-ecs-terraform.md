---
title: Do commit ao deploy - CI/CD de uma API na AWS usando GitHub Actions, ECS e Terraform.
description: Aprenda a criar uma pipeline completa de CI/CD para uma API na AWS utilizando GitHub Actions, ECS e Terraform para automatizar deploys.
date: 2026-03-12
category: Cloud
tags: 
    - devops
    - dotnet
    - tutorial
    - aws
---

## Introdução

Colocar uma aplicação em produção vai muito além de escrever código. Envolve compilar, testar, empacotar e entregar de forma confiável e repetível. Neste artigo, vou mostrar como construir uma pipeline completa — do commit ao deploy — usando **GitHub Actions** para CI/CD, **Terraform** para infraestrutura como código e **AWS** (ECR, ECS Fargate) como plataforma de execução.

O conceito apresentado aqui é **agnóstico de linguagem** — funciona para qualquer stack que rode em um container Docker (Node.js, Go, Java, Python, etc.). Para os exemplos práticos, vamos utilizar **.NET** como referência, mas os workflows, a infraestrutura Terraform e o fluxo de deploy são os mesmos independente da tecnologia escolhida.

O objetivo é demonstrar como essas ferramentas se conectam para formar um fluxo automatizado onde um simples merge na branch `main` resulta em uma nova versão rodando em produção, sem intervenção manual.

---

## Pré-requisitos

Antes de começar, você precisa ter as seguintes ferramentas instaladas e configuradas:

| Ferramenta | Descrição | Link de instalação |
|------------|-----------|--------------------|
| **Docker** | Para construir e executar containers | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |
| **Terraform** | Para provisionar infraestrutura como código | [developer.hashicorp.com/terraform/install](https://developer.hashicorp.com/terraform/install) |
| **AWS CLI** | Para interagir com os serviços da AWS via terminal | [docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) |
| **Git** | Para versionamento de código | [git-scm.com/downloads](https://git-scm.com/downloads) |
| **Conta AWS** | Com permissões para criar recursos (IAM, ECS, ECR) | [aws.amazon.com/free](https://aws.amazon.com/free/) |
| **Conta GitHub** | Para hospedar o repositório e rodar os workflows | [github.com](https://github.com/) |

> **Nota:** Para o exemplo deste artigo, também é necessário o [.NET SDK](https://dotnet.microsoft.com/download) instalado localmente para desenvolvimento. Se você estiver usando outra stack, substitua pelo SDK correspondente (Node.js, Go, JDK, etc.). Outro ponto é que a escolha em utilizar o ECS ao invés de um EKS ou EC2 é devido sua simplicidade na curva de aprendizado, baixo gerenciamento e que para fins de aprendizado os recursos mínimos definidos para esse laboratório não gerem altos gastos para o aprendizado.

---

## Visão Geral da Arquitetura

O fluxo completo funciona assim:

```plaintext
Developer → Feature Branch → Pull Request → Validação (CI)
                                                  ↓
                                            Merge na main
                                                  ↓
                                         Build & Push (CD)
                                                  ↓
                                        Deploy no ECS Fargate
```

---

## Configurando o IAM para o Terraform

Antes de rodar qualquer `terraform apply`, é necessário que o Terraform tenha permissões para criar recursos na AWS. Para isso, precisamos de um **usuário IAM** (ou role) com as permissões adequadas e configurar suas credenciais localmente.

### Criando um usuário IAM para o Terraform

No console da AWS (IAM > Users), crie um usuário dedicado para o Terraform:

1. Acesse **IAM > Users > Create User**
2. Nomeie o usuário (ex: `terraform-deployer`)
3. Anexe as policies necessárias para os recursos que serão criados:

```plaintext
AmazonECS_FullAccess
AmazonEC2ContainerRegistryFullAccess
AmazonVPCReadOnlyAccess
IAMFullAccess
CloudWatchLogsFullAccess
AmazonS3FullAccess
```

> **Nota de segurança:** Em um ambiente produtivo, o ideal é criar uma **policy customizada** com o princípio do menor privilégio, concedendo apenas as permissões estritamente necessárias. Para fins de estudo, as managed policies acima simplificam o setup.

4. Após criar o usuário, gere um **Access Key** (IAM > Users > Security credentials > Create access key)
5. Selecione o caso de uso **Command Line Interface (CLI)**

### Configurando as credenciais localmente

Com o AWS CLI instalado, configure as credenciais:

```bash
aws configure
```

Será solicitado:

```plaintext
AWS Access Key ID: AKIA...
AWS Secret Access Key: wJal...
Default region name: us-east-1
Default output format: json
```

Isso cria o arquivo `~/.aws/credentials` que o Terraform utilizará automaticamente via o provider AWS. Com isso feito, o Terraform tem autorização para provisionar os recursos que definiremos a seguir.

---

## Infraestrutura como Código com Terraform

Antes de qualquer pipeline rodar, a infraestrutura precisa existir. Com o Terraform, declaramos todos os recursos AWS em arquivos `.tf` e provisionamos com um único comando.

### Recursos Provisionados

```hcl
# Provider AWS
provider "aws" {
  region = "us-east-1"
}

# Repositório ECR para armazenar imagens Docker
resource "aws_ecr_repository" "app_repository" {
  name = "minha-app-repository"
}

# Cluster ECS
resource "aws_ecs_cluster" "app_cluster" {
  name = "minha-app-cluster"
}
```

### IAM Role para Tarefas ECS

O ECS precisa de uma role para puxar imagens e enviar logs:

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

resource "aws_iam_role_policy_attachment" "ecs_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
```

### Task Definition (Fargate)

Aqui definimos como o container será executado:

```hcl
resource "aws_ecs_task_definition" "app_task" {
  family                   = "minha-app-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([{
    name      = "app"
    image     = "${aws_ecr_repository.app_repository.repository_url}:latest"
    portMappings = [{
      containerPort = 8080
      hostPort      = 8080
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/minha-app"
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}
```

### ECS Service

O service mantém o container rodando e gerencia o deploy:

```hcl
resource "aws_ecs_service" "app_service" {
  name            = "minha-app-service"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.app_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.app_sg.id]
    assign_public_ip = true
  }
}
```

### OIDC: Autenticação Sem Credenciais Estáticas

Este é um dos pontos mais importantes da arquitetura. Em vez de armazenar `AWS_ACCESS_KEY` e `AWS_SECRET_KEY` como secrets no GitHub, usamos **OIDC (OpenID Connect)** para que o GitHub Actions troque um token temporário por credenciais AWS.

```hcl
# Registra o GitHub como provedor OIDC na AWS
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["ffffffffffffffffffffffffffffffffffffffff"]
}

# Role que o GitHub Actions vai assumir
resource "aws_iam_role" "github_actions_role" {
  name = "github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:meu-usuario/meu-repo:ref:refs/heads/main"
        }
      }
    }]
  })
}
```

**Por que isso importa?** Credenciais estáticas são um risco de segurança. Com OIDC, as credenciais são temporárias e o acesso é restrito a uma branch específica de um repositório específico. Mesmo que alguém tenha acesso ao repositório, não consegue assumir a role a partir de outra branch.

---

## Dockerfile Multi-Stage

Usamos um build multi-stage para separar o ambiente de compilação do ambiente de execução, resultando em uma imagem final menor e mais segura:

```dockerfile
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["MeuProjeto/MeuProjeto.csproj", "MeuProjeto/"]
RUN dotnet restore "MeuProjeto/MeuProjeto.csproj"
COPY . .
WORKDIR "/src/MeuProjeto"
RUN dotnet build -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MeuProjeto.dll"]
```

**Benefícios do multi-stage:**
- A imagem final contém apenas o runtime, não o SDK completo
- Reduz significativamente o tamanho da imagem
- O código-fonte não fica presente na imagem de produção

---

## Pipeline de CI

A primeira pipeline roda automaticamente quando um Pull Request é aberto contra a branch `main`. Seu objetivo é validar que o código compila e que os testes passam.

```yaml
name: PR Validation

on:
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Restore
        run: dotnet restore MinhaSolution.sln

      - name: Build
        run: dotnet build MinhaSolution.sln --no-restore -c Release

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Run Tests with Coverage
        run: |
          dotnet test MinhaSolution.sln \
            --collect:"XPlat Code Coverage" \
            --results-directory ./coverage
```

### O que acontece nesta pipeline:

1. **Job `build`** — Compila a solução para garantir que não há erros de compilação
2. **Job `test`** — Roda os testes unitários com cobertura de código usando Coverlet

Separar em dois jobs traz clareza: se o build falha, você sabe que é erro de compilação. Se o test falha, o código compila mas tem um bug.

---

## Protegendo a Branch Main

Com a pipeline de CI configurada, é fundamental garantir que **nenhum código chegue à `main` sem passar pela validação**. Para isso, configuramos uma **branch protection rule** no GitHub.

Acesse **Settings > Branches > Add branch protection rule** no seu repositório e configure:

1. **Branch name pattern:** `main`
2. Marque **Require a pull request before merging** — impede push direto na main
3. Marque **Require status checks to pass before merging** — bloqueia o merge até que os checks passem
4. Em **Status checks that are required**, busque e adicione os jobs da pipeline de CI:
   - `build`
   - `test`

> **Nota:** Na primeira vez que configurar, os status checks podem não aparecer na busca. Eles só ficam disponíveis após a pipeline rodar pelo menos uma vez no repositório. Abra um PR de teste para que os checks sejam registrados.

---

## Configurando as Secrets no GitHub

Antes de configurar a pipeline de deploy, é necessário cadastrar as **secrets** no repositório do GitHub. A pipeline de CD depende delas para autenticar na AWS e saber para onde enviar a imagem Docker.

Acesse **Settings > Secrets and variables > Actions > New repository secret** no seu repositório e crie as seguintes secrets:

| Secret | Valor | Exemplo |
|--------|-------|---------|
| `AWS_ROLE` | O **ARN completo** da IAM Role criada para o GitHub Actions | `arn:aws:iam::123456789012:role/github-actions-role` |
| `ECR_REPOSITORY` | A **URI completa** do repositório ECR (não apenas o nome) | `123456789012.dkr.ecr.us-east-1.amazonaws.com/minha-app-repository` |
| `AWS_ACCOUNT_ID` | O ID numérico da sua conta AWS | `123456789012` |

> **Atenção:** Um erro comum é colocar apenas o nome do repositório ECR (ex: `minha-app-repository`) na secret `ECR_REPOSITORY`. O valor correto é a **URI completa** que inclui o domínio do ECR. Você pode obter essa URI no console da AWS em **ECR > Repositories** ou via CLI:

```bash
aws ecr describe-repositories --repository-names minha-app-repository \
  --query "repositories[0].repositoryUri" --output text
```

Da mesma forma, a secret `AWS_ROLE` deve conter o **ARN** (Amazon Resource Name) completo da role, não apenas o nome. Para consultar:

```bash
aws iam get-role --role-name github-actions-role \
  --query "Role.Arn" --output text
```

Com as secrets configuradas, a pipeline de deploy consegue autenticar via OIDC, fazer push da imagem para o ECR e disparar o deploy no ECS.

---

## Pipeline de CD

Quando o PR é aprovado e mergeado na `main`, a pipeline de deploy entra em ação:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

permissions: #permissões necessárias para autenticação OIDC
  id-token: write
  contents: read 

env:
  AWS_REGION: us-east-1

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS Credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build Docker Image
        run: docker build -t minha-app .

      - name: Tag Image
        run: docker tag minha-app:latest ${{ secrets.ECR_REPOSITORY }}:latest

      - name: Push to ECR
        run: docker push ${{ secrets.ECR_REPOSITORY }}:latest

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster minha-app-cluster \
            --service minha-app-service \
            --force-new-deployment
```

### O que acontece nesta pipeline:

1. **Autenticação OIDC** — O GitHub troca seu token JWT por credenciais AWS temporárias
2. **Login no ECR** — Autentica o Docker no registro da AWS
3. **Build e Push** — Constrói a imagem Docker e envia para o ECR
4. **Deploy** — Dispara um novo deployment no ECS, que puxa a imagem atualizada e substitui o container antigo

O `--force-new-deployment` garante que o ECS vai iniciar uma nova task mesmo que a tag da imagem (`latest`) não tenha mudado.

---

## Acessando a Aplicação após o Deploy

Após a pipeline de CD concluir com sucesso, a aplicação estará rodando no ECS Fargate. Como configuramos `assign_public_ip = true` no Terraform, a task recebe um **IP público** que pode ser usado para acessar a API.

### Obtendo o IP público pelo Console AWS

1. Acesse **ECS > Clusters > minha-app-cluster**
2. Clique na aba **Tasks**
3. Clique na task em execução (status `RUNNING`)
4. Na seção **Network**, copie o **Public IP**
5. Acesse no navegador: `http://<PUBLIC_IP>:8080`

### Obtendo o IP público via CLI

```bash
# 1. Obtenha o ARN da task em execução
TASK_ARN=$(aws ecs list-tasks \
  --cluster minha-app-cluster \
  --service-name minha-app-service \
  --query "taskArns[0]" --output text)

# 2. Obtenha o ID da interface de rede (ENI)
ENI_ID=$(aws ecs describe-tasks \
  --cluster minha-app-cluster \
  --tasks $TASK_ARN \
  --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" \
  --output text)

# 3. Obtenha o IP público
aws ec2 describe-network-interfaces \
  --network-interface-ids $ENI_ID \
  --query "NetworkInterfaces[0].Association.PublicIp" \
  --output text
```

> **Importante:** O IP público muda toda vez que uma nova task é criada (ou seja, a cada deploy). Para um ambiente produtivo, o ideal é utilizar um **Application Load Balancer (ALB)** ou um **domínio com Route 53** apontando para o serviço ECS, garantindo um endereço fixo. Para fins de estudo, o IP público direto é suficiente.

---

## Segurança: OIDC em Detalhe

Vale reforçar a importância do OIDC neste fluxo. O modelo tradicional funciona assim:

```plaintext
❌ Modelo Tradicional:
   GitHub Secrets → AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
   - Credenciais estáticas que nunca expiram
   - Se vazadas, acesso total até serem rotacionadas manualmente
```

Com OIDC:

```plaintext
✅ Modelo OIDC:
   GitHub Actions → JWT Token → AWS STS → Credenciais Temporárias
   - Credenciais expiram automaticamente
   - Escopo restrito: apenas uma branch de um repositório específico
   - Sem segredos de longa duração armazenados
```

A configuração requer:
1. Registrar o GitHub como OIDC Provider na AWS (via Terraform)
2. Criar uma IAM Role com trust policy apontando para o repositório
3. No workflow, usar `permissions: id-token: write` e a action `configure-aws-credentials` com `role-to-assume`

---

## Fluxo Completo: Do Commit ao Deploy

Resumindo o ciclo de vida de uma mudança:

```shell
1. git checkout -b feature/minha-feature
2. # Desenvolve e commita
3. git push origin feature/minha-feature
4. # Abre Pull Request → Dispara pr-validation.yml
   │
   ├── ✅ Build compila com sucesso
   └── ✅ Testes passam com cobertura
   │
5. # Code review + Aprovação
6. # Merge na main → Dispara build-and-deploy.yml
   │
   ├── 🔐 Autenticação via OIDC
   ├── 🐳 Build da imagem Docker (multi-stage)
   ├── 📦 Push para o ECR
   └── 🚀 Deploy no ECS Fargate
   │
7. # Nova versão rodando em produção
```

---

## Considerações Finais

Este setup demonstra como é possível construir uma pipeline profissional de CI/CD com ferramentas modernas e boas práticas:

- **Infraestrutura como Código** — Toda a infraestrutura é versionada e reproduzível
- **Autenticação Keyless** — OIDC elimina o risco de credenciais estáticas
- **Serverless Containers** — Fargate remove a necessidade de gerenciar servidores
- **Separação CI/CD** — Validação em PRs e deploy apenas na main
- **Imagens otimizadas** — Multi-stage build reduz a superfície de ataque

O custo de infraestrutura para um setup como esse é mínimo — com Fargate usando 0.25 vCPU e 512MB de memória, o custo fica na faixa de poucos dólares por mês para ambientes de estudo e projetos pequenos.

A barreira de entrada para CI/CD profissional diminuiu muito. Ferramentas como GitHub Actions e Terraform tornam acessível o que antes exigia equipes dedicadas de DevOps. O importante é começar simples, entender cada peça, e evoluir conforme a necessidade.

---

*Este artigo foi escrito com base em um projeto prático de estudo. Todo o código-fonte está disponível publicamente neste repositório do [GitHub](https://github.com/fernanduandrade/api-quality-lab).*