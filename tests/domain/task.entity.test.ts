import { createTask, applyTaskUpdate } from '@/src/domain/task/task.entity';

describe('Task Domain Entity', () => {
  it('should create a valid task entity', () => {
    const task = createTask({
      userId: 'user-1',
      title: ' Test Task ',
      description: ' Description ',
    });

    expect(task.title).toBe('Test Task'); // Trimmed
    expect(task.description).toBe('Description'); // Trimmed
    expect(task.status).toBe('pending');
    expect(task.userId).toBe('user-1');
  });

  it('should apply updates correctly', () => {
    const task = createTask({
      userId: 'user-1',
      title: 'Original',
    });

    const updated = applyTaskUpdate(task, { title: 'Updated', status: 'completed' });

    expect(updated.title).toBe('Updated');
    expect(updated.status).toBe('completed');
    expect(updated.taskId).toBe(task.taskId);
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(task.updatedAt).getTime());
  });
});
