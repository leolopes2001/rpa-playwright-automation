import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import amqp, { type ChannelModel, type ConfirmChannel } from 'amqplib';
import { RABBITMQ } from '../messaging.constants.js';

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private connection?: ChannelModel;
  private channel?: ConfirmChannel;
  private connecting?: Promise<void>;

  async onModuleInit() {
    await this.getChannel();
  }

  async getChannel(): Promise<ConfirmChannel> {
    if (!this.channel) {
      this.connecting ??= this.connect().catch((error) => {
        this.connecting = undefined;
        throw error;
      });
      await this.connecting;
    }
    return this.channel!;
  }

  private async connect() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL ?? RABBITMQ.defaultUrl);
    this.channel = await this.connection.createConfirmChannel();
    await this.assertTopology(this.channel);
  }

  private async assertTopology(channel: ConfirmChannel) {
    await channel.assertExchange(RABBITMQ.exchanges.jobs, 'direct', { durable: true });
    await channel.assertExchange(RABBITMQ.exchanges.events, 'topic', { durable: true });
    await channel.assertQueue(RABBITMQ.queues.deadLetter, { durable: true });
    await channel.assertQueue(RABBITMQ.queues.retry, {
      durable: true,
      arguments: {
        'x-message-ttl': RABBITMQ.retryDelayMs,
        'x-dead-letter-exchange': RABBITMQ.exchanges.jobs,
        'x-dead-letter-routing-key': RABBITMQ.routingKeys.jobCreated,
      },
    });
    await channel.assertQueue(RABBITMQ.queues.jobs, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': RABBITMQ.queues.deadLetter,
      },
    });
    await channel.bindQueue(RABBITMQ.queues.jobs, RABBITMQ.exchanges.jobs, RABBITMQ.routingKeys.jobCreated);
    await channel.assertQueue(RABBITMQ.queues.results, { durable: true });
    await channel.bindQueue(RABBITMQ.queues.results, RABBITMQ.exchanges.events, RABBITMQ.routingKeys.executionEvents);
    await channel.prefetch(RABBITMQ.prefetch);
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
