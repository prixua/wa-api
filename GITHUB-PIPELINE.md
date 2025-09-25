# GitHub Actions: CI/CD Pipeline para Docker Hub

Este documento fornece instruções sobre como configurar o pipeline CI/CD do GitHub Actions para construir e publicar automaticamente a imagem Docker no Docker Hub.

## Configuração dos Secrets no GitHub

Antes de usar o workflow, você precisa adicionar dois secrets ao seu repositório GitHub:

1. Acesse seu repositório no GitHub
2. Vá para "Settings" > "Secrets and variables" > "Actions"
3. Clique em "New repository secret"
4. Adicione os seguintes secrets:

   - **DOCKERHUB_USERNAME**
     - Nome: `DOCKERHUB_USERNAME`
     - Valor: Seu nome de usuário do Docker Hub

   - **DOCKERHUB_TOKEN**
     - Nome: `DOCKERHUB_TOKEN`
     - Valor: Um token de acesso pessoal do Docker Hub (não sua senha)
     - [Instruções para gerar um token](https://docs.docker.com/docker-hub/access-tokens/)

## Como o Workflow Funciona

O workflow `.github/workflows/docker-build.yml` está configurado para:

1. Ser acionado apenas quando houver um commit ou merge na branch `main`
2. Fazer checkout do código-fonte
3. Configurar o ambiente Docker
4. Fazer login no Docker Hub usando seus secrets
5. Construir a imagem Docker usando o `Dockerfile`
6. Fazer push da imagem para o Docker Hub com duas tags:
   - `prixua/whatsapp-api:latest` (tag principal sempre atualizada)
   - `prixua/whatsapp-api:sha-xxxxxx` (onde xxxxxx é o hash do commit, para rastreabilidade)

## Testes e Execução Manual

Você pode acionar o workflow manualmente:

1. Vá para a aba "Actions" no seu repositório
2. Selecione o workflow "Build and Push Docker Image"
3. Clique em "Run workflow" > "Run workflow"

## Customizações Comuns

### Mudar o nome da imagem Docker

Se quiser alterar o nome da imagem, edite o arquivo `.github/workflows/docker-build.yml` e modifique a linha:

```yaml
images: prixua/whatsapp-api
```

### Adicionar suporte para múltiplas arquiteturas

Para adicionar suporte para ARM e outras arquiteturas, modifique a linha:

```yaml
platforms: linux/amd64
```

Para:

```yaml
platforms: linux/amd64,linux/arm64
```

### Usar um Dockerfile diferente

Se quiser usar outro Dockerfile (por exemplo, o Alpine para uma imagem menor), modifique a linha:

```yaml
file: ./Dockerfile
```