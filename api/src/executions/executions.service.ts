import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { assertPublicUrl } from './url-validator.js';
import type { CreateExecutionDto, ListExecutionsDto } from './executions.dto.js';

@Injectable()
export class ExecutionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExecutionDto, idempotencyKey: string) {
    const existing = await this.prisma.execution.findUnique({ where: { idempotencyKey } });
    if (existing) return existing;
    const url = await assertPublicUrl(dto.url);
    const executionId = randomUUID();
    const now = new Date();
    const payload = {
      schemaVersion: 1,
      messageId: randomUUID(),
      executionId,
      correlationId: executionId,
      url,
      attempt: 1,
      createdAt: now.toISOString(),
    };
    try {
      return await this.prisma.$transaction(async (tx) => {
        const execution = await tx.execution.create({ data: { id: executionId, idempotencyKey, url } });
        await tx.executionEvent.create({ data: { id: randomUUID(), executionId, type: 'CREATED', message: 'Solicitacao recebida', status: 'QUEUED', progress: 0 } });
        await tx.outboxMessage.create({ data: { aggregateId: executionId, routingKey: 'job.created', payload } });
        return execution;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return this.prisma.execution.findUniqueOrThrow({ where: { idempotencyKey } });
      }
      throw error;
    }
  }

  async list(query: ListExecutionsDto) {
    const items = await this.prisma.execution.findMany({
      where: { status: query.status, url: query.search ? { contains: query.search, mode: 'insensitive' } : undefined },
      orderBy: { createdAt: 'desc' },
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      include: { _count: { select: { events: true, artifacts: true } } },
    });
    const hasMore = items.length > query.limit;
    if (hasMore) items.pop();
    return { items, nextCursor: hasMore ? items.at(-1)?.id : null };
  }

  async findOne(id: string) {
    const execution = await this.prisma.execution.findUnique({
      where: { id },
      include: { events: { orderBy: { createdAt: 'asc' } }, attempts: { orderBy: { number: 'asc' } }, artifacts: { orderBy: { createdAt: 'asc' } } },
    });
    if (!execution) throw new NotFoundException('Execucao nao encontrada.');
    return execution;
  }

  async findArtifact(executionId: string, artifactId: string) {
    const artifact = await this.prisma.executionArtifact.findFirst({ where: { id: artifactId, executionId } });
    if (!artifact) throw new NotFoundException('Artefato nao encontrado.');
    return artifact;
  }
}
