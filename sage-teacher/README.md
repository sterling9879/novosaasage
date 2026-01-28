# Sage Teacher

Sistema de tutoria adaptativo com IA para preparação de vestibulares e concursos brasileiros.

## Stack

- **Backend**: Express.js + better-sqlite3 + JWT auth
- **Frontend**: React + Vite + TailwindCSS
- **IA**: Claude API (Anthropic)

## Portas

- Frontend: 3002
- Backend: 4001

## Instalação

### Desenvolvimento Local

1. Configure as variáveis de ambiente:

```bash
cp .env.example .env
# Edite o .env com suas chaves
```

2. Backend:

```bash
cd backend
npm install
npm run dev
```

3. Frontend:

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
# Copie e configure o .env
cp .env.example .env

# Inicie os containers
docker-compose up -d
```

## Deploy no VPS (Atualização)

### Primeira vez:

```bash
cd /var/www
git clone <repo-url> novosaasage
cd novosaasage/sage-teacher

# Configurar ambiente
cp .env.example .env
nano .env  # Configure ANTHROPIC_API_KEY e JWT_SECRET

# Backend
cd backend
npm install
pm2 start npm --name "sage-teacher-backend" -- start

# Frontend
cd ../frontend
npm install
npm run build
pm2 start npm --name "sage-teacher-frontend" -- run preview
```

### Atualizar código:

```bash
cd /var/www/novosaasage

# Baixar atualizações
git pull origin claude/simple-ai-chat-wavespeed-2hrrd

# Atualizar Backend
cd sage-teacher/backend
npm install
pm2 restart sage-teacher-backend

# Atualizar Frontend
cd ../frontend
npm install
npm run build
pm2 restart sage-teacher-frontend
```

### Script de atualização rápida:

Crie o arquivo `update.sh`:

```bash
#!/bin/bash
cd /var/www/novosaasage
git pull origin claude/simple-ai-chat-wavespeed-2hrrd

cd sage-teacher/backend
npm install
pm2 restart sage-teacher-backend

cd ../frontend
npm install
npm run build
pm2 restart sage-teacher-frontend

echo "Sage Teacher atualizado!"
```

Depois execute: `chmod +x update.sh && ./update.sh`

## Funcionalidades

- Matérias e tópicos organizados para vestibular
- Questões adaptativas geradas por IA
- Sistema de progresso e domínio
- Chat com tutor IA para tirar dúvidas
- Explicações detalhadas para erros
- Dificuldade adaptativa baseada no desempenho

## API Endpoints

### Auth
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário

### Subjects
- `GET /api/subjects` - Listar matérias
- `GET /api/subjects/:id` - Detalhes da matéria com tópicos

### Study
- `POST /api/study/sessions` - Iniciar sessão de estudo
- `POST /api/study/questions/generate` - Gerar questão
- `POST /api/study/questions/answer` - Submeter resposta
- `POST /api/study/explain` - Obter explicação
- `GET /api/study/stats` - Estatísticas do usuário

### Chat
- `POST /api/chat` - Enviar mensagem
- `GET /api/chat/history` - Histórico de mensagens
- `DELETE /api/chat/history` - Limpar histórico
