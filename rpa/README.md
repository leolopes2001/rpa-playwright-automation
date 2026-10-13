# RPA Worker

Worker Python que consome jobs do RabbitMQ e executa a automação web com Playwright.

## Responsabilidades

- consumir a fila `rpa.jobs` com concorrência limitada;
- validar novamente URLs e redirects contra SSRF;
- iniciar Chromium isolado por execução;
- publicar progresso, resultado e erros;
- capturar screenshots no volume de artefatos;
- aplicar timeout, retry com backoff e DLQ;
- confirmar jobs somente após a publicação dos eventos.

## Estrutura

```text
rpa/
├── bot.py             # Automação Playwright reutilizável
├── worker.py          # Consumidor e produtor RabbitMQ
├── config.py          # Variáveis de ambiente
├── requirements.txt   # Dependências Python
└── Dockerfile         # Chromium e runtime não-root
```

## Filas

| Fila | Uso |
|---|---|
| `rpa.jobs` | Jobs prontos para processamento |
| `rpa.jobs.retry` | Espera antes de uma nova tentativa |
| `rpa.results` | Eventos e resultados para a API |
| `rpa.dlq` | Jobs que excederam o limite de tentativas |

## Modo standalone

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
TARGET_URL=https://example.com python bot.py
```

## Modo worker

```bash
RABBITMQ_URL=amqp://rpa:rpa_local@localhost:5672/ python worker.py
```

Variáveis operacionais principais: `WORKER_CONCURRENCY`, `MAX_ATTEMPTS`, `JOB_TIMEOUT_SECONDS`, `TIMEOUT_MS`, `HEADLESS`, `WORKER_ID` e `ARTIFACTS_DIR`.

## Validação

```bash
python3 -m py_compile bot.py config.py worker.py
```

A imagem Docker usa Debian Bookworm porque é compatível com o Chromium fornecido pelo Playwright 1.44.
