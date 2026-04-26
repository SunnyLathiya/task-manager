import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

/**
 * withErrorHandler — A wrapper for API routes to catch unexpected errors.
 * It ensures the API always returns a JSON response instead of an HTML crash page.
 */
export function withErrorHandler(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('[API Error]:', error);
      
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message,
      });
    }
  };
}
