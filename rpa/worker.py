import asyncio
import json
from datetime import datetime, timezone
from uuid import uuid4

import aio_pika
from aio_pika import DeliveryMode, ExchangeType, Message
from loguru import logger

from bot import RPABot
from config import JOB_TIMEOUT_SECONDS, MAX_ATTEMPTS, RABBITMQ_URL, WORKER_CONCURRENCY, WORKER_ID


def now_iso():
    return datetime.now(timezone.utc).isoformat()


async def main():
    connection = await aio_pika.connect_robust(RABBITMQ_URL)
    channel = await connection.channel(publisher_confirms=True)
    await channel.set_qos(prefetch_count=WORKER_CONCURRENCY)
    jobs_exchange = await channel.declare_exchange("rpa.jobs.exchange", ExchangeType.DIRECT, durable=True)
    events_exchange = await channel.declare_exchange("rpa.events.exchange", ExchangeType.TOPIC, durable=True)
    jobs = await channel.declare_queue(
        "rpa.jobs",
        durable=True,
        arguments={"x-dead-letter-exchange": "", "x-dead-letter-routing-key": "rpa.dlq"},
    )
    await jobs.bind(jobs_exchange, "job.created")
    await channel.declare_queue("rpa.dlq", durable=True)
    retry = await channel.declare_queue(
        "rpa.jobs.retry",
        durable=True,
        arguments={
            "x-message-ttl": 10000,
            "x-dead-letter-exchange": "rpa.jobs.exchange",
            "x-dead-letter-routing-key": "job.created",
        },
    )

    async def publish_event(job, event_type, progress, message, status="PROCESSING", **extra):
        payload = {
            "schemaVersion": 1,
            "id": str(uuid4()),
            "executionId": job["executionId"],
            "attempt": job["attempt"],
            "type": event_type,
            "status": status,
            "progress": progress,
            "message": message,
            "workerId": WORKER_ID,
            "createdAt": now_iso(),
            **extra,
        }
        await events_exchange.publish(
            Message(json.dumps(payload).encode(), delivery_mode=DeliveryMode.PERSISTENT, correlation_id=job["executionId"]),
            routing_key=f"execution.{event_type.lower()}",
        )

    async def process(message: aio_pika.abc.AbstractIncomingMessage):
        job = json.loads(message.body)
        bot = RPABot(job["executionId"])

        async def progress(event_type, percent, text, artifact=None):
            await publish_event(job, event_type, percent, text, artifact=artifact)

        try:
            result = await asyncio.wait_for(bot.run(job["url"], progress), timeout=JOB_TIMEOUT_SECONDS)
            await publish_event(job, "COMPLETED", 100, "Processamento concluido", status="SUCCESS", result=result)
            await message.ack()
        except Exception as error:
            logger.exception("Falha na execucao {}", job["executionId"])
            if job["attempt"] < MAX_ATTEMPTS:
                job["attempt"] += 1
                await channel.default_exchange.publish(
                    Message(json.dumps(job).encode(), delivery_mode=DeliveryMode.PERSISTENT),
                    routing_key=retry.name,
                )
                await publish_event(job, "RETRY_SCHEDULED", 0, "Nova tentativa agendada", status="QUEUED", error=str(error)[:1000])
                await message.ack()
            else:
                await publish_event(job, "FAILED", 100, "Processamento falhou", status="FAILED", error=str(error)[:1000])
                await message.reject(requeue=False)

    await jobs.consume(process, no_ack=False)
    logger.info("Worker {} aguardando jobs", WORKER_ID)
    try:
        await asyncio.Future()
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(main())