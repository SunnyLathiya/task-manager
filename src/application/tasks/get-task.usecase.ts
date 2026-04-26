import type { ITaskRepository } from '@/src/domain/task/task.repository';
import type { TaskEntity } from '@/src/domain/task/task.entity';
import { TaskNotFoundError, TaskUnauthorizedError, type TaskDomainError } from '@/src/domain/task/task.errors';
import { ok, err, type Result } from '@/src/domain/shared/result';

export class GetTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string, userId: string): Promise<Result<TaskEntity, TaskDomainError>> {
    const task = await this.taskRepository.findById(taskId);
    
    if (!task) {
      return err(new TaskNotFoundError(taskId));
    }

    if (task.userId !== userId) {
      return err(new TaskUnauthorizedError(taskId));
    }

    return ok(task);
  }
}
