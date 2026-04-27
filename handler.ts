import { DynamoDBUserRepository } from './src/infrastructure/dynamodb/user.repository';
import { DynamoDBTaskRepository } from './src/infrastructure/dynamodb/task.repository';
import { RegisterUserUseCase } from './src/application/auth/register.usecase';
import { LoginUserUseCase } from './src/application/auth/login.usecase';
import { CreateTaskUseCase } from './src/application/tasks/create-task.usecase';
import { ListTasksUseCase } from './src/application/tasks/list-tasks.usecase';
import { GetTaskUseCase } from './src/application/tasks/get-task.usecase';
import { UpdateTaskUseCase } from './src/application/tasks/update-task.usecase';
import { DeleteTaskUseCase } from './src/application/tasks/delete-task.usecase';
import { verifyToken } from './src/lib/jwt';

const userRepository = new DynamoDBUserRepository();
const taskRepository = new DynamoDBTaskRepository();
const registerUseCase = new RegisterUserUseCase(userRepository);
const loginUseCase = new LoginUserUseCase(userRepository);
const createTaskUseCase = new CreateTaskUseCase(taskRepository);
const listTasksUseCase = new ListTasksUseCase(taskRepository);
const getTaskUseCase = new GetTaskUseCase(taskRepository);
const updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);

export const handler = async (event: any) => {
  const path = event.rawPath || event.path;
  const method = event.requestContext.http.method;
  const body = event.body ? JSON.parse(event.body) : {};
  const headers = event.headers || {};
  const authHeader = headers['authorization'] || headers['Authorization'];

  // Helper for auth
  const getUserId = () => {
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return null;
    return decoded.userId;
  };

  const response = (statusCode: number, body: any) => ({
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
    },
    body: JSON.stringify(body),
  });
  
  // Handle Preflight OPTIONS requests
  if (method === 'OPTIONS') {
    return response(204, '');
  }

  try {
    // PUBLIC ROUTES
    if (path === '/api/auth/register' && method === 'POST') {
      const result = await registerUseCase.execute(body);
      return result.ok ? response(201, result.value) : response(400, { error: result.error.code });
    }
    if (path === '/api/auth/login' && method === 'POST') {
      const result = await loginUseCase.execute(body);
      return result.ok ? response(200, result.value) : response(401, { error: result.error.code });
    }

    // PROTECTED ROUTES
    const userId = getUserId();
    if (!userId) return response(401, { error: 'UNAUTHORIZED' });

    // Task CRUD
    if (path === '/api/tasks' && method === 'POST') {
      const result = await createTaskUseCase.execute({ ...body, userId });
      return result.ok ? response(201, result.value) : response(400, { error: result.error.code });
    }
    if (path === '/api/tasks' && method === 'GET') {
      const result = await listTasksUseCase.execute({ userId });
      return result.ok ? response(200, result.value) : response(400, { error: result.error.code });
    }
    
    // Dynamic Routes (GET, PUT, DELETE /api/tasks/{id})
    const taskId = path.split('/').pop();
    if (path.startsWith('/api/tasks/') && taskId) {
      if (method === 'GET') {
        const result = await getTaskUseCase.execute(taskId, userId);
        return result.ok ? response(200, result.value) : response(404, { error: result.error.code });
      }
      if (method === 'PUT') {
        const result = await updateTaskUseCase.execute(taskId, userId, body);
        return result.ok ? response(200, result.value) : response(404, { error: result.error.code });
      }
      if (method === 'DELETE') {
        const result = await deleteTaskUseCase.execute(taskId, userId);
        return result.ok ? response(200, { success: true }) : response(404, { error: result.error.code });
      }
    }

    return response(404, { error: 'NOT_FOUND' });
  } catch (error) {
    console.error(error);
    return response(500, { error: 'INTERNAL_SERVER_ERROR' });
  }
};
