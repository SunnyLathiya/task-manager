import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { GetTaskUseCase } from '@/src/application/tasks/get-task.usecase';
import { UpdateTaskUseCase } from '@/src/application/tasks/update-task.usecase';
import { DeleteTaskUseCase } from '@/src/application/tasks/delete-task.usecase';
import { DynamoDBTaskRepository } from '@/src/infrastructure/dynamodb/task.repository';
import { validateRequest } from '@/src/lib/validate';
import { withAuth, type AuthenticatedRequest } from '@/src/lib/middleware/with-auth';
import { withErrorHandler } from '@/src/lib/middleware/with-error-handler';

const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
});

const taskRepository = new DynamoDBTaskRepository();
const getTaskUseCase = new GetTaskUseCase(taskRepository);
const updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { userId } = req.user;
  const taskId = req.query.id as string;

  // GET /api/tasks/[id] — Get single task
  if (req.method === 'GET') {
    const result = await getTaskUseCase.execute(taskId, userId);
    
    if (result.ok) return res.status(200).json(result.value);
    
    const status = result.error.code === 'TASK_NOT_FOUND' ? 404 : 403;
    return res.status(status).json({ error: result.error.code, message: result.error.message });
  }

  // PUT /api/tasks/[id] — Update task
  if (req.method === 'PUT') {
    const data = await validateRequest(req, res, updateTaskSchema);
    if (!data) return;

    const result = await updateTaskUseCase.execute(taskId, userId, data);
    
    if (result.ok) return res.status(200).json(result.value);
    
    const status = result.error.code === 'TASK_NOT_FOUND' ? 404 : 403;
    return res.status(status).json({ error: result.error.code, message: result.error.message });
  }

  // DELETE /api/tasks/[id] — Delete task
  if (req.method === 'DELETE') {
    const result = await deleteTaskUseCase.execute(taskId, userId);
    
    if (result.ok) return res.status(204).end();
    
    const status = result.error.code === 'TASK_NOT_FOUND' ? 404 : 403;
    return res.status(status).json({ error: result.error.code, message: result.error.message });
  }

  return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
}

export default withErrorHandler(withAuth(handler));
