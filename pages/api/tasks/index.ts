import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { CreateTaskUseCase } from '@/src/application/tasks/create-task.usecase';
import { ListTasksUseCase } from '@/src/application/tasks/list-tasks.usecase';
import { DynamoDBTaskRepository } from '@/src/infrastructure/dynamodb/task.repository';
import { validateRequest } from '@/src/lib/validate';
import { withAuth, type AuthenticatedRequest } from '@/src/lib/middleware/with-auth';
import { withErrorHandler } from '@/src/lib/middleware/with-error-handler';

const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const taskRepository = new DynamoDBTaskRepository();
const createTaskUseCase = new CreateTaskUseCase(taskRepository);
const listTasksUseCase = new ListTasksUseCase(taskRepository);

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { userId } = req.user;

  // GET /api/tasks — List user's tasks
  if (req.method === 'GET') {
    const { status, limit, cursor } = req.query;
    
    const result = await listTasksUseCase.execute({
      userId,
      status: status as any,
      limit: limit ? parseInt(limit as string) : 20,
      cursor: cursor as string,
    });

    return res.status(200).json(result.value);
  }

  // POST /api/tasks — Create a new task
  if (req.method === 'POST') {
    const data = await validateRequest(req, res, createTaskSchema);
    if (!data) return;

    const result = await createTaskUseCase.execute({
      userId,
      title: data.title,
      description: data.description,
    });

    return res.status(201).json(result.value);
  }

  return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
}

export default withErrorHandler(withAuth(handler));
