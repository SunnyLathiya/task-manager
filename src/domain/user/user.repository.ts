import type { UserEntity } from './user.entity';

/**
 * IUserRepository — the port (interface) that defines User data operations.
 * Keeping this as an interface ensures the domain doesn't depend on DynamoDB.
 */
export interface IUserRepository {
  findById(userId: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<void>;
}
