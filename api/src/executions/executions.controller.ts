import { BadRequestException, Controller, Get, Header, Headers, MessageEvent, Param, Post, Query, Res, Sse, StreamableFile, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { createReadStream } from 'node:fs';
import { resolve, sep } from 'node:path';
import { interval, map, merge, type Observable } from 'rxjs';
import type { Response } from 'express';
import { EventBusService } from '../messaging/event-bus.service.js';
import { CreateExecutionDto, ListExecutionsDto } from './executions.dto.js';
import { ExecutionsService } from './executions.service.js';

@ApiTags('executions')
@Controller('executions')
export class ExecutionsController {
  constructor(private readonly executions: ExecutionsService, private readonly eventBus: EventBusService) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Enfileira uma nova execucao' })
  async create(@Body() dto: CreateExecutionDto, @Headers('idempotency-key') key?: string) {
    if (!key || key.length > 128) throw new BadRequestException('Envie um Idempotency-Key valido.');
    const execution = await this.executions.create(dto, key);
    return { id: execution.id, status: execution.status };
  }

  @Get()
  list(@Query() query: ListExecutionsDto) { return this.executions.list(query); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.executions.findOne(id); }

  @Sse(':id/stream')
  stream(@Param('id') id: string): Observable<MessageEvent> {
    const events = this.eventBus.forExecution(id).pipe(map((event) => ({ id: event.id, type: 'execution', data: event })));
    const heartbeat = interval(15000).pipe(map(() => ({ type: 'heartbeat', data: { at: new Date().toISOString() } })));
    return merge(events, heartbeat);
  }

  @Get(':id/artifacts/:artifactId')
  async artifact(@Param('id') id: string, @Param('artifactId') artifactId: string, @Res({ passthrough: true }) response: Response) {
    const artifact = await this.executions.findArtifact(id, artifactId);
    const root = resolve(process.env.ARTIFACTS_DIR ?? '/artifacts');
    const file = resolve(root, artifact.key);
    if (!file.startsWith(`${root}${sep}`)) throw new BadRequestException('Caminho de artefato invalido.');
    response.setHeader('Content-Type', artifact.mimeType);
    response.setHeader('Content-Disposition', `inline; filename="${artifact.name.replaceAll('"', '')}"`);
    return new StreamableFile(createReadStream(file));
  }
}
