import { v4 as uuidv4 } from 'uuid';

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

/**
 * TaskEntity — representing a user's task.
 */
export interface TaskEntity {
  readonly userId: string;       // Owner
  readonly taskId: string;       // Primary Key
  readonly title: string;        // Max 100 chars
  readonly description?: string; // Max 500 chars
  readonly status: TaskStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateTaskProps {
  userId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
}

/** Factory to build a valid TaskEntity */
export function createTask(props: CreateTaskProps): TaskEntity {
  const now = new Date().toISOString();
  return {
    userId: props.userId,
    taskId: uuidv4(),
    title: props.title.trim(),
    description: props.description?.trim(),
    status: props.status ?? 'pending',
    createdAt: now,
    updatedAt: now,
  };
}

export interface UpdateTaskProps {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export interface ListTasksFilter {
  status?: TaskStatus;
  limit?: number;
  cursor?: string;
}

/** Immutable merge for task updates */
export function applyTaskUpdate(task: TaskEntity, update: UpdateTaskProps): TaskEntity {
  return {
    ...task,
    ...(update.title !== undefined && { title: update.title.trim() }),
    ...(update.description !== undefined && { description: update.description.trim() }),
    ...(update.status !== undefined && { status: update.status }),
    updatedAt: new Date().toISOString(),
  };
}
