#!/bin/bash

# ===========================================
# WaveSpeed Chat - Script de Instalação
# ===========================================

set -e

echo "========================================"
echo "  WaveSpeed Chat - Instalação"
echo "========================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}Erro: Execute este script dentro do diretório wavespeed-chat${NC}"
    echo ""
    echo "Uso:"
    echo "  git clone https://github.com/sterling9879/novosaasage.git"
    echo "  cd novosaasage/wavespeed-chat"
    echo "  chmod +x install.sh"
    echo "  ./install.sh"
    exit 1
fi

# Verificar Node.js
echo -e "${YELLOW}[1/6]${NC} Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js não encontrado!${NC}"
    echo ""
    echo "Instale o Node.js 20 com:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "  sudo apt install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js versão 18+ é necessária. Versão atual: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) encontrado${NC}"

# Instalar dependências
echo ""
echo -e "${YELLOW}[2/6]${NC} Instalando dependências..."
npm install
echo -e "${GREEN}✓ Dependências instaladas${NC}"

# Configurar .env
echo ""
echo -e "${YELLOW}[3/6]${NC} Configurando ambiente..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    # Gerar secret aleatório
    SECRET=$(openssl rand -base64 32 2>/dev/null || echo "wavespeed-chat-secret-$(date +%s)")
    sed -i "s/your-secret-key-here/$SECRET/" .env
    echo -e "${GREEN}✓ Arquivo .env criado${NC}"
else
    echo -e "${YELLOW}! Arquivo .env já existe, mantendo configuração atual${NC}"
fi

# Setup Prisma
echo ""
echo -e "${YELLOW}[4/6]${NC} Configurando banco de dados..."
npx prisma generate
npx prisma db push
echo -e "${GREEN}✓ Banco de dados configurado${NC}"

# Seed
echo ""
echo -e "${YELLOW}[5/6]${NC} Criando usuário admin..."
npx prisma db seed 2>/dev/null || echo -e "${YELLOW}! Admin já existe${NC}"
echo -e "${GREEN}✓ Usuário admin criado${NC}"

# Build (opcional)
echo ""
echo -e "${YELLOW}[6/6]${NC} Deseja fazer o build para produção? (s/N)"
read -r BUILD_CHOICE
if [[ "$BUILD_CHOICE" =~ ^[Ss]$ ]]; then
    npm run build
    echo -e "${GREEN}✓ Build concluído${NC}"
fi

# Finalização
echo ""
echo "========================================"
echo -e "${GREEN}  Instalação Concluída!${NC}"
echo "========================================"
echo ""
echo "Credenciais Admin:"
echo "  Email: admin@admin.com"
echo "  Senha: admin123"
echo ""
echo "Para iniciar:"
echo "  Desenvolvimento: npm run dev"
echo "  Produção:        npm start"
echo ""
echo "Acesse: http://localhost:3000"
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC} Configure sua API Key do WaveSpeed em /admin/settings"
echo ""
