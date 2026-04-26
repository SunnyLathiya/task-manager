import { createTask, applyTaskUpdate } from '@/src/domain/task/task.entity';

describe('TaskEntity Domain', () => {
  it('should default to "pending" status if none is provided', () => {
    const task = createTask({ userId: 'u1', title: 'Buy milk' });
    expect(task.status).toBe('pending');
  });

  it('should trim title and description', () => {
    const task = createTask({ userId: 'u1', title: '  Title  ', description: '  Desc  ' });
    expect(task.title).toBe('Title');
    expect(task.description).toBe('Desc');
  });

  it('should not mutate the original task when applying updates', () => {
    const task = createTask({ userId: 'u1', title: 'Old' });
    const updated = applyTaskUpdate(task, { title: 'New', status: 'completed' });
    
    expect(updated.title).toBe('New');
    expect(updated.status).toBe('completed');
    expect(task.title).toBe('Old'); // Original remains unchanged
    expect(task.status).toBe('pending');
  });
});
