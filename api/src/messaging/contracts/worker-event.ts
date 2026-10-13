import type { Prisma } from '@prisma/client';
import type { LiveExecutionEvent } from '../event-bus.service.js';

export interface WorkerArtifact {
  name: string;
  key: string;
  mimeType: string;
  size: number;
}

export interface WorkerEvent extends LiveExecutionEvent {
  schemaVersion: number;
  attempt: number;
  workerId?: string;
  result?: Prisma.InputJsonValue;
  error?: string;
  artifact?: WorkerArtifact;
}

export function parseWorkerEvent(payload: Buffer): WorkerEvent {
  const event = JSON.parse(payload.toString()) as WorkerEvent;
  if (event.schemaVersion !== 1 || !event.id || !event.executionId || !event.attempt) {
    throw new Error('Evento do worker invalido');
  }
  return event;
}
