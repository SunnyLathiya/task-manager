import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { RegisterUserUseCase } from '@/src/application/auth/register.usecase';
import { DynamoDBUserRepository } from '@/src/infrastructure/dynamodb/user.repository';
import { validateRequest } from '@/src/lib/validate';
import { withErrorHandler } from '@/src/lib/middleware/with-error-handler';

// 1. Define the schema for validation
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

// 2. Initialize the backend components
const userRepository = new DynamoDBUserRepository();
const registerUseCase = new RegisterUserUseCase(userRepository);

/**
 * POST /api/auth/register
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  // 3. Validate input
  const data = await validateRequest(req, res, registerSchema);
  if (!data) return;

  // 4. Execute use-case
  const result = await registerUseCase.execute(data);

  // 5. Handle result
  if (result.ok) {
    return res.status(201).json(result.value);
  } else {
    return res.status(400).json({ 
      error: result.error.code, 
      message: result.error.message 
    });
  }
}

export default withErrorHandler(handler);
