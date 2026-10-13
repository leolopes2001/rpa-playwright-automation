export const RABBITMQ = {
  defaultUrl: 'amqp://guest:guest@localhost:5672',
  exchanges: {
    jobs: 'rpa.jobs.exchange',
    events: 'rpa.events.exchange',
  },
  queues: {
    jobs: 'rpa.jobs',
    retry: 'rpa.jobs.retry',
    results: 'rpa.results',
    deadLetter: 'rpa.dlq',
  },
  routingKeys: {
    jobCreated: 'job.created',
    executionEvents: 'execution.*',
  },
  prefetch: 20,
  retryDelayMs: 10_000,
  outboxIntervalMs: 1_000,
} as const;
