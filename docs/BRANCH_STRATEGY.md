# Estratégia de Branches e Deploy

## 📋 **Visão Geral**

Este projeto utiliza Gitflow com as seguintes branches:

### 🌿 **Branches Principais**

- **`main`** - Branch de produção

  - ✅ Deploy automático no Render
  - ✅ Criação de tags automáticas
  - ✅ Imagem Docker com tag específica
  - 🔒 Protegida (não aceita push direto)

- **`develop`** - Branch de desenvolvimento
  - ✅ Build e teste automático
  - ✅ Push para Docker Hub (latest)
  - ❌ **NÃO faz deploy no Render**
  - 🔒 Protegida (não aceita push direto)

### 🔄 **Fluxo de Trabalho**

1. **Desenvolvimento** → `develop`

   - Todas as features são desenvolvidas aqui
   - Pipeline executa build e testes
   - Imagem Docker é criada com tag `latest`

2. **Release** → `main`
   - Merge de `develop` para `main` via Pull Request
   - Deploy automático no Render
   - Criação de tag no GitHub
   - Imagem Docker com tag específica

## 🚀 **Pipeline CI/CD**

### **Branch `develop`:**

- ✅ Checkout
- ✅ Install dependencies
- ✅ Build
- ✅ Generate version
- ✅ Build Docker image (tag: latest)
- ✅ Push to Docker Hub
- ❌ **NÃO deploy no Render**

### **Branch `main`:**

- ✅ Checkout
- ✅ Install dependencies
- ✅ Build
- ✅ Generate version
- ✅ Create Git tag
- ✅ Build Docker image (tag: específica)
- ✅ Push to Docker Hub
- ✅ **Deploy no Render**

## 📝 **Comandos Úteis**

```bash
# Desenvolver nova feature
git checkout develop
git pull origin develop
# ... fazer alterações ...
git add .
git commit -m "feat: nova funcionalidade"
git push origin develop

# Fazer release para produção
git checkout main
git merge develop
git push origin main
```

## 🎯 **Benefícios**

- **Segurança**: Apenas `main` faz deploy em produção
- **Rastreabilidade**: Tags específicas para cada release
- **Testes**: `develop` permite testes sem afetar produção
- **Rollback**: Possibilidade de voltar para versão anterior
