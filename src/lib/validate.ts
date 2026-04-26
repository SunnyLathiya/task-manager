import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * validateRequest — A helper to validate the request body against a Zod schema.
 * If validation fails, it automatically sends a 400 response and returns null.
 */
export async function validateRequest<T>(
  req: NextApiRequest,
  res: NextApiResponse,
  schema: z.Schema<T>,
): Promise<T | null> {
  const result = schema.safeParse(req.body);
  
  if (!result.success) {
    res.status(400).json({
      error: 'VALIDATION_FAILED',
      details: result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return null;
  }
  
  return result.data;
}
