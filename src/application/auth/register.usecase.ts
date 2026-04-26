import type { IUserRepository } from '@/src/domain/user/user.repository';
import { createUser, toUserPublicView, type UserPublicView } from '@/src/domain/user/user.entity';
import { EmailAlreadyExistsError } from '@/src/domain/user/user.errors';
import { hashPassword } from '@/src/lib/password';
import { ok, err, type Result } from '@/src/domain/shared/result';

export interface RegisterUserDTO {
  email: string;
  password: string;
}

/**
 * RegisterUserUseCase — Orchestrates the creation of a new user.
 */
export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: RegisterUserDTO): Promise<Result<UserPublicView, EmailAlreadyExistsError>> {
    // 1. Check if user already exists
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      return err(new EmailAlreadyExistsError(dto.email));
    }

    // 2. Hash the password
    const passwordHash = await hashPassword(dto.password);

    // 3. Create domain entity
    const user = createUser({
      email: dto.email,
      passwordHash,
    });

    // 4. Persist to infrastructure
    await this.userRepository.save(user);

    // 5. Return success result with public view
    return ok(toUserPublicView(user));
  }
}
