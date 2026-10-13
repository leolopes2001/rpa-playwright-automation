import { Global, Module } from '@nestjs/common';
import { EventBusService } from './event-bus.service.js';
import { WorkerEventHandlerService } from './consumers/worker-event-handler.service.js';
import { WorkerEventsConsumerService } from './consumers/worker-events-consumer.service.js';
import { OutboxPublisherService } from './outbox/outbox-publisher.service.js';
import { RabbitMqService } from './rabbitmq/rabbitmq.service.js';

@Global()
@Module({
	providers: [
		EventBusService,
		RabbitMqService,
		OutboxPublisherService,
		WorkerEventHandlerService,
		WorkerEventsConsumerService,
	],
	exports: [EventBusService],
})
export class MessagingModule {}
