# Colab Zeladoria - Triagem Inteligente

Sistema de triagem automatizada de solicitações urbanas usando IA generativa.

## Visão Geral

Aplicação fullstack que recebe relatos de problemas urbanos em texto livre, processa com IA (Groq + Llama 3.3) e retorna categorização, prioridade e resumo técnico estruturado.

**Fluxo:**
1. Cidadão descreve problema no formulário web
2. Sistema envia para API backend
3. IA analisa e categoriza automaticamente
4. Dados estruturados salvos no PostgreSQL

## Arquitetura

```
┌─────────────────┐
│    Frontend     │  Next.js 16 + React 19 + shadcn/ui
│  (Interface)    │  Validação: Zod + react-hook-form
└────────┬────────┘
         │ REST API
┌────────▼────────┐
│    Backend      │  NestJS 11 + TypeScript
│  (API + IA)     │  Validação: class-validator
└──┬──────────┬───┘
   │          │
   │     ┌────▼─────┐
   │     │    IA    │  Groq Cloud (Llama 3.3 70B)
   │     │  Module  │  JSON Mode + Retry Logic
   │     └──────────┘
   │
┌──▼──────────┐
│  PostgreSQL │  Prisma ORM + Migrations
│    (Banco)  │  Type-safe queries
└─────────────┘
```

**Escolhas arquiteturais:**
- Monorepo com pnpm workspaces para compartilhamento de tipos
- Clean Architecture: camadas bem definidas (Controller → Service → Repository)
- Dependency Injection nativa do NestJS
- Validação em duas camadas (frontend + backend)
- Prompt engineering com few-shot learning para IA

## Stack Tecnológica

**Backend:**
- NestJS 11.0.1
- TypeScript 5 (strict mode)
- Prisma 7.4.1
- PostgreSQL 16
- Groq SDK 0.37.0
- Jest (testes)

**Frontend:**
- Next.js 16.1.6
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui
- Zod 4.3.6
- React Hook Form 7.71.2

**DevOps:**
- pnpm 10.30.2 (monorepo)
- Docker + docker-compose
- ESLint + Prettier

## Como Rodar Localmente

### Pré-requisitos

- Node.js 20+
- pnpm 10+ (`npm install -g pnpm`)
- Docker (ou PostgreSQL 15+ instalado)
- Groq API Key (gratuita em https://console.groq.com/keys)

### Passo a Passo

**1. Clonar repositório:**
```bash
git clone https://github.com/leiaoliver/Colab-Zeladoria-Inteligente-com-IA.git
cd Colab-Zeladoria-Inteligente-com-IA
```

**2. Configurar variáveis de ambiente:**

Backend - `apps/backend/.env`:
```bash
cp apps/backend/.env.example apps/backend/.env
```

Edite o arquivo com suas credenciais:
```env
DATABASE_URL="postgresql://admin:admin@localhost:5432/zeladoria"
GROQ_API_KEY=gsk_sua_chave_aqui
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001
```

Frontend - `apps/frontend/.env.local`:
```bash
cp apps/frontend/.env.local.example apps/frontend/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**3. Subir banco de dados:**
```bash
docker-compose up -d
```

**4. Instalar dependências:**
```bash
pnpm install
```

**5. Rodar migrations:**
```bash
cd apps/backend
pnpm exec prisma migrate dev
cd ../..
```

**6. Iniciar aplicação:**

Terminal 1 - Backend:
```bash
cd apps/backend
pnpm start:dev
```

Terminal 2 - Frontend:
```bash
cd apps/frontend
pnpm dev
```

**7. Acessar:**
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- Health check: http://localhost:3000/health

## Testes

### E2E (Integração)
```bash
cd apps/backend
pnpm test:e2e
```
Principais cenários cobertos:
- Criação de relato com processamento por IA (POST /report)
- Listagem de relatos (GET /report)
- Busca de relato por ID (GET /report/:id)
- Validação de entrada e CORS

### Outros comandos úteis:
```bash
# Lint e formatação
cd apps/backend
pnpm lint          # ESLint com correções automáticas
pnpm format        # Prettier

# Visualizar dados do banco
pnpm exec prisma studio  # Interface web para o banco

# Resetar banco (desenvolvimento)
pnpm exec prisma migrate reset
```

## Docker

### Desenvolvimento (apenas banco):
```bash
docker-compose up -d
```

### Produção (stack completo):
```bash
docker-compose -f docker-compose.prod.yml up -d
```

Serviços:
- PostgreSQL: `localhost:5432`
- Backend: `localhost:3000`
- Frontend: `localhost:3001`

## API

Base URL: `http://localhost:3000`

### Endpoints

**POST /report** - Criar relatório
```json
{
  "title": "Buraco na rua",
  "description": "Buraco grande na Rua Principal causando acidentes",
  "location": "Rua Principal, 123"
}
```

Resposta (201):
```json
{
  "id": "uuid",
  "title": "Buraco na rua",
  "description": "Buraco grande na Rua Principal causando acidentes",
  "location": "Rua Principal, 123",
  "status": "OPEN",
  "category": "Manutenção de Vias",
  "priority": "ALTA",
  "technicalSummary": "Solicitação emergencial de reparo em via pública...",
  "createdAt": "2026-02-25T22:00:00Z",
  "updatedAt": "2026-02-25T22:00:00Z"
}
```

**GET /report** - Listar relatórios

**GET /report/:id** - Buscar por ID

**GET /health** - Health check

## Variáveis de Ambiente

### Backend (`.env`)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `GROQ_API_KEY` | API key do Groq Cloud | `gsk_...` |
| `NODE_ENV` | Ambiente de execução | `development` ou `production` |
| `PORT` | Porta do servidor | `3000` |
| `CORS_ORIGIN` | Origem permitida para CORS | `http://localhost:3001` |

### Frontend (`.env.local`)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL da API backend | `http://localhost:3000` |

## Estrutura do Projeto

```
colab-zeladoria-ai/
├── apps/
│   ├── backend/              # API NestJS
│   │   ├── src/
│   │   │   ├── ai/          # Módulo IA (Groq)
│   │   │   ├── prisma/      # Módulo Prisma
│   │   │   ├── report/      # Módulo Reports
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── test/            # Testes E2E
│   │   └── Dockerfile
│   │
│   └── frontend/            # Interface Next.js
│       ├── app/
│       │   ├── components/  # Componentes React
│       │   ├── page.tsx     # Página principal
│       │   └── layout.tsx
│       ├── lib/
│       │   ├── api.ts       # Cliente HTTP
│       │   ├── types.ts     # TypeScript types
│       │   └── validation.ts # Schemas Zod
│       └── Dockerfile
│
├── docker-compose.yml       # Docker dev
├── docker-compose.prod.yml  # Docker prod
├── pnpm-workspace.yaml      # Configuração monorepo
└── README.md
```

## Troubleshooting

### Problema: "GROQ_API_KEY não configurada"
- **Solução**: Obtenha uma chave gratuita em https://console.groq.com/keys
- Adicione no arquivo `apps/backend/.env`

### Problema: Erro de conexão com banco
- **Solução**: Verifique se o PostgreSQL está rodando com `docker-compose up -d`
- Confira a `DATABASE_URL` no `.env`

### Problema: Porta já em uso
- **Backend (3000)**: Mude `PORT=3001` no `.env` do backend
- **Frontend (3001)**: Use `pnpm dev -- -p 3002` ou mude no package.json

### Problema: Testes travando
- **Solução**: Os testes usam `forceExit`, avisos sobre worker processes são normais

---

**Desenvolvido por:** Léia Oliveira
**Desafio:** Colab - Zeladoria Inteligente com IA 
