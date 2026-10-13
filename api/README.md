# API

Serviço NestJS responsável pelo contrato HTTP, persistência PostgreSQL, mensageria RabbitMQ e atualizações SSE.

## Responsabilidades

- validar URLs públicas e bloquear SSRF;
- criar execuções idempotentes;
- publicar jobs por outbox transacional;
- consumir e deduplicar eventos do worker;
- manter histórico, tentativas, resultados e artefatos;
- transmitir progresso em tempo real por SSE;
- disponibilizar Swagger e health check.

## Estrutura

```text
src/
├── executions/             # DTOs, validação, controller e casos de uso
├── messaging/
│   ├── consumers/          # Consumo e persistência de eventos do worker
│   ├── contracts/          # Contratos e parsing das mensagens
│   ├── outbox/             # Publicação transacional de jobs
│   ├── rabbitmq/           # Conexão e declaração da topologia
│   ├── event-bus.service.ts# Distribuição dos eventos SSE
│   └── messaging.constants.ts
├── prisma/                 # Ciclo de vida do Prisma Client
├── app.module.ts           # Composição dos módulos
└── main.ts                 # Bootstrap, CORS, validação e Swagger
prisma/
├── migrations/             # Migrations versionadas
└── schema.prisma           # Modelo de dados
```

Cada provider de mensageria possui uma única responsabilidade. Alterações de topologia ficam em `rabbitmq/`; regras de persistência dos eventos ficam em `consumers/`; publicação de jobs fica em `outbox/`.

## Endpoints

| Método | Caminho | Finalidade |
|---|---|---|
| `POST` | `/executions` | Criar ou recuperar uma execução idempotente |
| `GET` | `/executions` | Listar e filtrar execuções |
| `GET` | `/executions/:id` | Consultar detalhe e histórico |
| `GET` | `/executions/:id/stream` | Receber eventos SSE |
| `GET` | `/executions/:id/artifacts/:artifactId` | Visualizar artefato |
| `GET` | `/health` | Verificar liveness |

A documentação OpenAPI fica disponível em `/docs`.

## Desenvolvimento

Suba primeiro PostgreSQL e RabbitMQ pela raiz:

```bash
docker compose up -d postgres rabbitmq
cd api
npm install
npx prisma generate
npm run start:dev
```

Ajuste `DATABASE_URL`, `RABBITMQ_URL`, `CORS_ORIGIN` e `ARTIFACTS_DIR` conforme o ambiente.

## Validação

```bash
npm run lint
npm test
npm run build
```

As migrations de produção são executadas pelo serviço one-shot `migrate` do Compose antes da API iniciar.
