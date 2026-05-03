import type { ITaskRepository } from '@/src/domain/task/task.repository';
import { TaskNotFoundError, TaskUnauthorizedError, type TaskDomainError } from '@/src/domain/task/task.errors';
import { ok, err, type Result } from '@/src/domain/shared/result';

export class DeleteTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string, userId: string): Promise<Result<void, TaskDomainError>> {
    try {
      await this.taskRepository.delete(taskId, userId);
      return ok(undefined);
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        // Return NotFound instead of Unauthorized to avoid leaking existence of tasks
        return err(new TaskNotFoundError(taskId));
      }
      throw error;
    }
  }
}
