import type { ITaskRepository } from '@/src/domain/task/task.repository';
import type { TaskEntity, TaskStatus } from '@/src/domain/task/task.entity';
import { ok, type Result } from '@/src/domain/shared/result';

export interface ListTasksDTO {
  userId: string;
  status?: TaskStatus;
  limit?: number;
  cursor?: string;
}

export class ListTasksUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(dto: ListTasksDTO): Promise<Result<{ items: TaskEntity[]; nextKey?: string }, any>> {
    const result = await this.taskRepository.findByUserId(dto.userId, {
      status: dto.status,
      limit: dto.limit,
      cursor: dto.cursor,
    });
    return ok(result);
  }
}
