import type { ITaskRepository } from '@/src/domain/task/task.repository';
import { applyTaskUpdate, type TaskEntity, type UpdateTaskProps } from '@/src/domain/task/task.entity';
import { TaskNotFoundError, TaskUnauthorizedError, type TaskDomainError } from '@/src/domain/task/task.errors';
import { ok, err, type Result } from '@/src/domain/shared/result';

export class UpdateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string, userId: string, props: UpdateTaskProps): Promise<Result<TaskEntity, TaskDomainError>> {
    const task = await this.taskRepository.findById(taskId);
    
    if (!task) {
      return err(new TaskNotFoundError(taskId));
    }

    if (task.userId !== userId) {
      return err(new TaskUnauthorizedError(taskId));
    }

    const updatedTask = applyTaskUpdate(task, props);
    await this.taskRepository.update(updatedTask);
    
    return ok(updatedTask);
  }
}
