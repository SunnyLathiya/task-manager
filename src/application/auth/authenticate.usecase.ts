import { verifyToken, type JwtPayload } from '@/src/lib/jwt';
import { ok, err, type Result } from '@/src/domain/shared/result';

export class AuthenticateUseCase {
  async execute(token: string): Promise<Result<JwtPayload, Error>> {
    try {
      const payload = verifyToken(token);
      if (!payload) {
        return err(new Error('Invalid or expired token'));
      }
      return ok(payload);
    } catch (error: any) {
      return err(new Error(error.message || 'Authentication failed'));
    }
  }
}
