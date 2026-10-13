import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RABBITMQ } from '../messaging.constants.js';
import { RabbitMqService } from '../rabbitmq/rabbitmq.service.js';

@Injectable()
export class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisherService.name);
  private timer?: NodeJS.Timeout;
  private publishing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitMq: RabbitMqService,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.publishPending(), RABBITMQ.outboxIntervalMs);
  }

  async publishPending() {
    if (this.publishing) return;
    this.publishing = true;
    try {
      const channel = await this.rabbitMq.getChannel();
      const messages = await this.prisma.outboxMessage.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: 20,
      });

      for (const message of messages) {
        try {
          channel.publish(
            RABBITMQ.exchanges.jobs,
            message.routingKey,
            Buffer.from(JSON.stringify(message.payload)),
            {
              persistent: true,
              contentType: 'application/json',
              correlationId: message.aggregateId,
              messageId: message.id,
            },
          );
          await channel.waitForConfirms();
          await this.prisma.outboxMessage.update({
            where: { id: message.id },
            data: { status: 'PUBLISHED', publishedAt: new Date(), attempts: { increment: 1 } },
          });
        } catch (error) {
          this.logger.error(`Falha publicando outbox ${message.id}`, error);
          await this.prisma.outboxMessage.update({
            where: { id: message.id },
            data: { attempts: { increment: 1 } },
          });
        }
      }
    } finally {
      this.publishing = false;
    }
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
