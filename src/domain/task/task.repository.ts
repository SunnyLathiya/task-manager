import type { TaskEntity, TaskStatus } from './task.entity';

export interface ListTasksFilter {
  status?: TaskStatus;
  limit?: number;
  cursor?: string;
}

/**
 * ITaskRepository — defines Task data operations.
 */
export interface ITaskRepository {
  save(task: TaskEntity): Promise<void>;
  findById(taskId: string): Promise<TaskEntity | null>;
  findByUserId(
    userId: string,
    filter?: ListTasksFilter,
  ): Promise<{ items: TaskEntity[]; nextKey?: string }>;
  update(task: TaskEntity): Promise<void>;
  delete(taskId: string, userId: string): Promise<void>;
}
