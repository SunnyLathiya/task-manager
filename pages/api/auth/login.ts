import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { LoginUserUseCase } from '@/src/application/auth/login.usecase';
import { DynamoDBUserRepository } from '@/src/infrastructure/dynamodb/user.repository';
import { validateRequest } from '@/src/lib/validate';
import { withErrorHandler } from '@/src/lib/middleware/with-error-handler';

// 1. Define the schema for validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

// 2. Initialize the backend components
const userRepository = new DynamoDBUserRepository();
const loginUseCase = new LoginUserUseCase(userRepository);

/**
 * POST /api/auth/login
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  // 3. Validate input
  const data = await validateRequest(req, res, loginSchema);
  if (!data) return;

  // 4. Execute use-case
  const result = await loginUseCase.execute(data);

  // 5. Handle result
  if (result.ok) {
    return res.status(200).json(result.value);
  } else {
    // 401 Unauthorized for invalid credentials
    return res.status(401).json({ 
      error: result.error.code, 
      message: result.error.message 
    });
  }
}

export default withErrorHandler(handler);
