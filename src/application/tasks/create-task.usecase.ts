import type { ITaskRepository } from '@/src/domain/task/task.repository';
import { createTask, type TaskEntity } from '@/src/domain/task/task.entity';
import { ok, type Result } from '@/src/domain/shared/result';

export interface CreateTaskDTO {
  userId: string;
  title: string;
  description?: string;
}

export class CreateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(dto: CreateTaskDTO): Promise<Result<TaskEntity, never>> {
    const task = createTask(dto);
    await this.taskRepository.save(task);
    return ok(task);
  }
}
