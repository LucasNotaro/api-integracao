# API P2 - Integração e Entrega Contínua

API REST com CRUD de usuários, integração com BetterStack para logs, documentação Swagger e pipeline CI/CD completo.

## Funcionalidades

- **CRUD completo** de usuários
- **Integração com BetterStack** para logs estruturados
- **Documentação Swagger** automática
- **Docker** para containerização
- **Pipeline CI/CD** com GitHub Actions
- **Deploy automático** no Render
- **Banco de dados PostgreSQL** online
- **Health check** e endpoints de monitoramento

## Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- Conta no GitHub
- Conta no Docker Hub
- Conta no Render
- Conta no BetterStack
- Banco de dados PostgreSQL online (ex: Supabase, Railway, etc.)

## Configuração Local

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd api-integracao
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de dados
DATABASE_URL=postgresql://usuario:senha@host:porta/banco

# BetterStack
BETTERSTACK_URL=https://in.logs.betterstack.com/
BETTERSTACK_TOKEN=seu_token_aqui

# Ambiente
NODE_ENV=development
PORT=3000
```

### 4. Execute com Docker Compose (Recomendado)

```bash
npm run docker:compose
```

### 5. Ou execute localmente

```bash
npm run dev
```

## Docker

### Build da imagem

```bash
npm run docker:build
```

### Executar container

```bash
npm run docker:run
```

### Docker Compose (Backend + PostgreSQL)

```bash
npm run docker:compose
```

## Endpoints da API

### Base

- `GET /` - Informações da API
- `GET /health` - Health check
- `GET /api-docs` - Documentação Swagger

### Usuários (CRUD)

- `GET /usuarios` - Listar todos os usuários
- `GET /usuarios/:id` - Buscar usuário por ID
- `POST /usuarios` - Criar usuário
- `PUT /usuarios/:id` - Atualizar usuário
- `DELETE /usuarios/:id` - Deletar usuário

### Logs

- `GET /test-log` - Testar integração com BetterStack

## Configuração do CI/CD

### 1. GitHub Secrets

Configure os seguintes secrets no seu repositório GitHub:

```
DOCKER_USERNAME=seu_usuario_dockerhub
DOCKER_PASSWORD=sua_senha_dockerhub
RENDER_API_KEY=sua_api_key_render
RENDER_SERVICE_ID=id_do_servico_render
BETTERSTACK_URL=https://in.logs.betterstack.com/
BETTERSTACK_TOKEN=seu_token_betterstack
DATABASE_URL=sua_url_banco_dados
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_app_gmail
NOTIFICATION_EMAIL=email_para_notificacoes
```

### 2. Docker Hub

- Crie um repositório no Docker Hub com o mesmo nome do repositório GitHub
- Configure as credenciais no GitHub Secrets

### 3. Render

- Crie um novo Web Service
- Configure para usar Docker
- Configure as variáveis de ambiente
- Obtenha o Service ID e API Key

### 4. BetterStack

- Crie um novo source para logs
- Configure a URL e token
- Adicione as credenciais no GitHub Secrets

## Pipeline CI/CD

O pipeline inclui as seguintes etapas:

### CI (Continuous Integration)

- Checkout do código
- Instalação de dependências
- Build da aplicação
- Versionamento automático
- Build da imagem Docker

### CD (Continuous Deployment)

- Push da imagem para Docker Hub
- Criação da tag Latest
- Atualização de variáveis no Render
- Deploy automático no Render
- Notificação por email em caso de erro

## Logs e Monitoramento

### BetterStack

- Logs estruturados de todas as requisições
- Métricas de performance
- Alertas configuráveis
- Dashboard em tempo real

### Winston

- Logs locais em arquivos
- Rotação automática
- Diferentes níveis de log

## Testes

### Teste local

```bash
# Teste a API
curl http://localhost:3000/health

# Teste CRUD
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome":"João","email":"joao@email.com"}'

# Teste logs
curl http://localhost:3000/test-log
```

### Teste com Docker

```bash
# Execute os testes
docker-compose up --build
```

## Padrões de Commit

Siga o padrão Conventional Commits:

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração de código
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

## Gitflow

- `main` - Código em produção
- `develop` - Código em desenvolvimento
- `feature/*` - Novas funcionalidades
- `hotfix/*` - Correções urgentes
- `release/*` - Preparação para release

## Segurança

- Todas as credenciais sensíveis em GitHub Secrets
- Variáveis de ambiente para configuração
- SSL/TLS em produção
- Validação de entrada de dados
- Tratamento de erros estruturado

## Monitoramento

### Métricas coletadas

- Tempo de resposta das requisições
- Taxa de erro
- Uso de recursos
- Logs estruturados
- Health checks

### Alertas

- Falhas no pipeline CI/CD
- Erros na aplicação
- Tempo de resposta alto
- Falhas de deploy