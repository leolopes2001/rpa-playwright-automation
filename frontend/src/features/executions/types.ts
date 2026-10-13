export type ExecutionStatus =
  | "QUEUED"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

export interface ExecutionEvent {
  id: string;
  type: string;
  message: string;
  status?: ExecutionStatus;
  progress?: number;
  createdAt: string;
}

export interface ExecutionArtifact {
  id: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface ExecutionResult {
  title?: string;
  links?: Array<{ text: string; href: string }>;
}

export interface Execution {
  id: string;
  url: string;
  status: ExecutionStatus;
  progress: number;
  attemptCount: number;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  result?: ExecutionResult;
  error?: string;
  events?: ExecutionEvent[];
  artifacts?: ExecutionArtifact[];
}

export interface ExecutionFilters {
  status: ExecutionStatus | "";
  search: string;
}
