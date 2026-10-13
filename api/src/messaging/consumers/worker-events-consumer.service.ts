import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ConsumeMessage } from 'amqplib';
import { EventBusService } from '../event-bus.service.js';
import { parseWorkerEvent } from '../contracts/worker-event.js';
import { RABBITMQ } from '../messaging.constants.js';
import { RabbitMqService } from '../rabbitmq/rabbitmq.service.js';
import { WorkerEventHandlerService } from './worker-event-handler.service.js';

@Injectable()
export class WorkerEventsConsumerService implements OnModuleInit {
  private readonly logger = new Logger(WorkerEventsConsumerService.name);

  constructor(
    private readonly rabbitMq: RabbitMqService,
    private readonly handler: WorkerEventHandlerService,
    private readonly eventBus: EventBusService,
  ) {}

  async onModuleInit() {
    const channel = await this.rabbitMq.getChannel();
    await channel.consume(
      RABBITMQ.queues.results,
      (message) => void this.consume(message),
      { noAck: false },
    );
  }

  private async consume(message: ConsumeMessage | null) {
    if (!message) return;
    const channel = await this.rabbitMq.getChannel();

    try {
      const event = parseWorkerEvent(message.content);
      await this.handler.handle(event);
      this.eventBus.publish(event);
      channel.ack(message);
    } catch (error) {
      this.logger.error('Falha consumindo evento do worker', error);
      channel.nack(message, false, false);
    }
  }
}
