# Frontend

Interface operacional do RPA Control, construída com Next.js, React, TypeScript e Tailwind.

## Responsabilidades

- enviar URLs públicas para processamento;
- listar e filtrar execuções;
- acompanhar progresso e eventos por SSE;
- apresentar timeline, tentativas, resultado, erros e screenshots;
- oferecer layout responsivo para desktop e mobile.

## Estrutura

```text
src/
├── app/
│   ├── executions/[id]/page.tsx  # Rota de detalhe
│   ├── globals.css               # Sistema visual responsivo
│   ├── layout.tsx                # Metadados e fontes
│   └── page.tsx                  # Entrada do dashboard
├── features/executions/
│   ├── components/               # Dashboard, formulário, tabela e detalhe
│   ├── executions.api.ts         # Operações HTTP da feature
│   ├── types.ts                  # Contratos de execução
│   ├── use-execution.ts          # Detalhe e conexão SSE
│   └── use-executions.ts         # Listagem, filtros e polling
└── lib/
    ├── formatters.ts             # Data e duração em pt-BR
    └── http-client.ts            # Cliente HTTP compartilhado
```

As rotas em `app/` apenas compõem a feature. Regras e chamadas de execuções não devem voltar para os arquivos de rota.

## Configuração

| Variável | Exemplo | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | URL pública da API acessível pelo navegador |

## Desenvolvimento

```bash
npm install
NEXT_PUBLIC_API_URL=http://localhost:3001 npm run dev
```

O painel estará em http://localhost:3000.

## Validação

```bash
npm run lint
npm run build
```

Para executar toda a plataforma, use o `docker-compose.yml` da raiz.
