import type { IUserRepository } from '@/src/domain/user/user.repository';
import { InvalidCredentialsError } from '@/src/domain/user/user.errors';
import { comparePassword } from '@/src/lib/password';
import { signToken } from '@/src/lib/jwt';
import { ok, err, type Result } from '@/src/domain/shared/result';
import { authSchemas } from '@/src/lib/validation';

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
    // 0. Joi Validation
    const { error } = authSchemas.login.validate(dto);
    if (error) {
      return err(new InvalidCredentialsError());
    }

    // 1. Find user by email
    const user = await this.userRepository.findByEmail(dto.email);

    // Constant-time dummy hash (bcrypt, cost 12) to mitigate timing attacks
    // This hash matches the password "dummy"
    const DUMMY_HASH = '$2b$12$1xZdLukwvju1z/3w9bD6J.VOtfBRWkZKRSJjrtvpwBO1F80l1BRXq';
    
    // 2. Verify password (always runs to prevent email enumeration via timing)
    const hashToCompare = user ? user.passwordHash : DUMMY_HASH;
    const isPasswordValid = await comparePassword(dto.password, hashToCompare);

    if (!user || !isPasswordValid) {
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
