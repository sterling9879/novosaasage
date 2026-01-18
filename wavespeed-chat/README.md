# WaveSpeed Chat

Chat de IA simples usando a API WaveSpeed como backend.

## Requisitos

- Node.js 20+
- npm ou yarn

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/sterling9879/novosaasage.git
cd novosaasage/wavespeed-chat
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` se necessário:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

**IMPORTANTE:** Em produção, mude o `NEXTAUTH_SECRET` para uma string aleatória segura.

### 4. Configure o banco de dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar banco de dados
npx prisma db push

# Criar usuário admin
npx prisma db seed
```

### 5. Execute a aplicação

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm run build
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## Credenciais Admin

- **Email:** admin@admin.com
- **Senha:** admin123

## Primeiro Acesso

1. Faça login com as credenciais admin
2. Acesse o painel admin em `/admin/settings`
3. Configure sua API Key do WaveSpeed
4. Volte ao chat e comece a conversar!

## Deploy em VPS Ubuntu 22.04

```bash
# 1. Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Instalar PM2
sudo npm install -g pm2

# 3. Clonar projeto
cd /var/www
git clone https://github.com/sterling9879/novosaasage.git
cd novosaasage/wavespeed-chat

# 4. Instalar dependências
npm install

# 5. Configurar .env
cp .env.example .env
nano .env
# Altere NEXTAUTH_SECRET e NEXTAUTH_URL para o IP da sua VPS

# 6. Setup do banco
npx prisma generate
npx prisma db push
npx prisma db seed

# 7. Build
npm run build

# 8. Rodar com PM2
pm2 start npm --name "wavespeed-chat" -- start
pm2 save
pm2 startup

# O app vai rodar em http://IP-DA-VPS:3000
```

## Estrutura do Projeto

```
wavespeed-chat/
├── prisma/
│   ├── schema.prisma    # Schema do banco de dados
│   └── seed.ts          # Script para criar admin
├── public/
│   └── logos/           # Logos dos providers de IA
├── src/
│   ├── app/
│   │   ├── (auth)/      # Páginas de login/registro
│   │   ├── admin/       # Painel administrativo
│   │   └── api/         # APIs do backend
│   ├── components/      # Componentes React
│   ├── lib/             # Utilitários (prisma, auth, wavespeed)
│   ├── providers/       # Providers React
│   ├── store/           # Estado global (Zustand)
│   └── types/           # Tipos TypeScript
└── ...
```

## Modelos de IA Disponíveis

| Provider   | Modelos                                    |
|------------|-------------------------------------------|
| Anthropic  | Claude 3.7 Sonnet, 3.5 Sonnet, 3 Haiku   |
| Google     | Gemini 2.5 Flash/Pro, 2.0 Flash          |
| OpenAI     | GPT-4o, GPT-4.1                          |
| Meta       | LLaMA 4 Maverick, LLaMA 4 Scout          |

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + SQLite
- NextAuth (credentials)
- Zustand
