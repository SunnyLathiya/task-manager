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
    // 1. Validate only the user-provided payload against the schema
    const { error, value } = taskSchemas.create.validate({ title: dto.title, description: dto.description });
    if (error) {
      return err(new ValidationError(error.details[0].message));
    }

    // 2. Explicitly map fields to prevent any runtime properties (like status) from persisting
    const task = createTask({
      userId: dto.userId,
      title: value.title,
      description: value.description,
    });
    await this.taskRepository.save(task);
    return ok(task);
  }
}
