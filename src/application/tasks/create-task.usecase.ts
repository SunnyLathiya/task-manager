import type { ITaskRepository } from '@/src/domain/task/task.repository';
import { createTask, type TaskEntity } from '@/src/domain/task/task.entity';
import { ok, err, type Result } from '@/src/domain/shared/result';
import { ValidationError } from '@/src/domain/shared/errors';

import { taskSchemas } from '@/src/lib/validation';

export interface CreateTaskDTO {
  userId: string;
  title: string;
  description?: string;
}

export class CreateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(dto: CreateTaskDTO): Promise<Result<TaskEntity, ValidationError>> {
    // Joi Validation
    const { error } = taskSchemas.create.validate({ title: dto.title, description: dto.description });
    if (error) {
      return err(new ValidationError(error.details[0].message));
    }

    const task = createTask(dto);
    await this.taskRepository.save(task);
    return ok(task);
  }
}
