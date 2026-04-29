import type { ITaskRepository } from '@/src/domain/task/task.repository';
import { applyTaskUpdate, type TaskEntity, type UpdateTaskProps } from '@/src/domain/task/task.entity';
import { TaskNotFoundError, TaskUnauthorizedError, type TaskDomainError } from '@/src/domain/task/task.errors';
import { ok, err, type Result } from '@/src/domain/shared/result';
import { ValidationError } from '@/src/domain/shared/errors';

import { taskSchemas } from '@/src/lib/validation';

export class UpdateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string, userId: string, props: UpdateTaskProps): Promise<Result<TaskEntity, TaskDomainError | ValidationError>> {
    // Joi Validation
    const { error } = taskSchemas.update.validate(props);
    if (error) {
      return err(new ValidationError(error.details[0].message));
    }

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
