import { AuthenticateUseCase } from '@/src/application/auth/authenticate.usecase';
import * as jwtLib from '@/src/lib/jwt';

jest.mock('@/src/lib/jwt');

describe('AuthenticateUseCase', () => {
  let useCase: AuthenticateUseCase;

  beforeEach(() => {
    useCase = new AuthenticateUseCase();
    jest.clearAllMocks();
  });

  it('should return payload on valid token', async () => {
    const mockPayload = { userId: '123', email: 'test@test.com' };
    (jwtLib.verifyToken as jest.Mock).mockReturnValue(mockPayload);

    const result = await useCase.execute('valid-token');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(mockPayload);
    }
  });

  it('should return error on invalid token', async () => {
    (jwtLib.verifyToken as jest.Mock).mockReturnValue(null);

    const result = await useCase.execute('invalid-token');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Invalid or expired token');
    }
  });
});
