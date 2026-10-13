import { Injectable } from '@nestjs/common';
import { Observable, Subject, filter } from 'rxjs';

export interface LiveExecutionEvent {
  executionId: string;
  id: string;
  type: string;
  message: string;
  status?: string;
  progress?: number;
  createdAt: string;
}

@Injectable()
export class EventBusService {
  private readonly events = new Subject<LiveExecutionEvent>();

  publish(event: LiveExecutionEvent) {
    this.events.next(event);
  }

  forExecution(executionId: string): Observable<LiveExecutionEvent> {
    return this.events.pipe(filter((event) => event.executionId === executionId));
  }
}
