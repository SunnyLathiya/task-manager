import type { IUserRepository } from '@/src/domain/user/user.repository';
import { createUser, toUserPublicView, type UserPublicView } from '@/src/domain/user/user.entity';
import { EmailAlreadyExistsError } from '@/src/domain/user/user.errors';
import { hashPassword } from '@/src/lib/password';
import { ok, err, type Result } from '@/src/domain/shared/result';
import { ValidationError } from '@/src/domain/shared/errors';

import { authSchemas } from '@/src/lib/validation';

export interface RegisterUserDTO {
  email: string;
  password: string;
}

export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: RegisterUserDTO): Promise<Result<UserPublicView, EmailAlreadyExistsError | ValidationError>> {
    // 0. Joi Validation
    const { error } = authSchemas.register.validate(dto);
    if (error) {
      return err(new ValidationError(error.details[0].message));
    }

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
