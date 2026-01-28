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
