import { Injectable } from '@nestjs/common';
import type { ExecutionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { WorkerEvent } from '../contracts/worker-event.js';

const TERMINAL_STATUSES: ExecutionStatus[] = ['SUCCESS', 'FAILED', 'CANCELLED'];

@Injectable()
export class WorkerEventHandlerService {
  constructor(private readonly prisma: PrismaService) {}

  async handle(event: WorkerEvent) {
    const eventDate = new Date(event.createdAt);
    const terminal = event.status === 'SUCCESS' || event.status === 'FAILED';

    await this.prisma.$transaction(async (transaction) => {
      const duplicate = await transaction.executionEvent.findUnique({ where: { id: event.id } });
      if (duplicate) return;

      await transaction.executionEvent.create({
        data: {
          id: event.id,
          executionId: event.executionId,
          type: event.type,
          message: event.message,
          status: event.status as ExecutionStatus | undefined,
          progress: event.progress,
          metadata: event.result,
          createdAt: eventDate,
        },
      });

      const execution = await transaction.execution.findUniqueOrThrow({ where: { id: event.executionId } });
      if (!TERMINAL_STATUSES.includes(execution.status)) {
        const startedAt = execution.startedAt ?? (event.status === 'PROCESSING' ? eventDate : undefined);
        const finishedAt = terminal ? eventDate : undefined;
        await transaction.execution.update({
          where: { id: event.executionId },
          data: {
            status: event.status as ExecutionStatus | undefined,
            progress: event.progress,
            workerId: event.workerId,
            attemptCount: Math.max(execution.attemptCount, event.attempt),
            startedAt,
            finishedAt,
            durationMs: finishedAt && startedAt ? finishedAt.getTime() - startedAt.getTime() : undefined,
            result: event.result,
            error: event.error,
          },
        });
      }

      await transaction.executionAttempt.upsert({
        where: { executionId_number: { executionId: event.executionId, number: event.attempt } },
        create: {
          executionId: event.executionId,
          number: event.attempt,
          status: (event.status ?? 'PROCESSING') as ExecutionStatus,
          workerId: event.workerId,
          error: event.error,
          finishedAt: terminal ? eventDate : undefined,
        },
        update: {
          status: (event.status ?? 'PROCESSING') as ExecutionStatus,
          workerId: event.workerId,
          error: event.error,
          finishedAt: terminal ? eventDate : undefined,
        },
      });

      if (event.artifact) {
        await transaction.executionArtifact.upsert({
          where: { executionId_key: { executionId: event.executionId, key: event.artifact.key } },
          create: { executionId: event.executionId, ...event.artifact },
          update: event.artifact,
        });
      }
    });
  }
}
