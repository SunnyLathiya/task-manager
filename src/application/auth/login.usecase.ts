import type { IUserRepository } from '@/src/domain/user/user.repository';
import { InvalidCredentialsError } from '@/src/domain/user/user.errors';
import { comparePassword } from '@/src/lib/password';
import { signToken } from '@/src/lib/jwt';
import { ok, err, type Result } from '@/src/domain/shared/result';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

/**
 * LoginUserUseCase — Orchestrates the authentication process.
 */
export class LoginUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: LoginDTO): Promise<Result<LoginResponse, InvalidCredentialsError>> {
    // 1. Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      return err(new InvalidCredentialsError());
    }

    // 2. Verify password
    const isPasswordValid = await comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      return err(new InvalidCredentialsError());
    }

    // 3. Generate JWT
    const token = signToken({
      userId: user.userId,
      email: user.email,
    });

    // 4. Return success result
    return ok({
      token,
      user: {
        id: user.userId,
        email: user.email,
      },
    });
  }
}
