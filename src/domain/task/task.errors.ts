export class TaskNotFoundError extends Error {
  readonly code = 'TASK_NOT_FOUND';
  constructor(taskId: string) {
    super(`Task not found: ${taskId}`);
    this.name = 'TaskNotFoundError';
  }
}

export class TaskUnauthorizedError extends Error {
  readonly code = 'TASK_UNAUTHORIZED';
  constructor(taskId: string) {
    super(`You do not have permission to access task: ${taskId}`);
    this.name = 'TaskUnauthorizedError';
  }
}

export type TaskDomainError = TaskNotFoundError | TaskUnauthorizedError;
