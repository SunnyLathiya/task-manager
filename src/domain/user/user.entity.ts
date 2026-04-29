import { v4 as uuidv4 } from 'uuid';

export type UserRole = 'user' | 'admin';

/**
 * User Interfaces
 */
export interface UserEntity {
  readonly userId: string;      // UUID v4
  readonly email: string;       // Unique, normalised
  readonly passwordHash: string;// bcrypt hash
  readonly role: UserRole;
  readonly createdAt: string;   // ISO 8601
  readonly updatedAt: string;   // ISO 8601
}

export interface CreateUserProps {
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export interface UserPublicView {
  id: string;
  email: string;
  createdAt: string;
}

/**
 * User Factory & Mapping Functions
 */

/** Factory function to create a new UserEntity */
export function createUser(props: CreateUserProps): UserEntity {
  const now = new Date().toISOString();
  return {
    userId: uuidv4(),
    email: props.email.toLowerCase().trim(),
    passwordHash: props.passwordHash,
    role: props.role ?? 'user',
    createdAt: now,
    updatedAt: now,
  };
}

/** Maps a UserEntity to a safe public view (removes password hash) */
export function toUserPublicView(user: UserEntity): UserPublicView {
  return {
    id: user.userId,
    email: user.email,
    createdAt: user.createdAt,
  };
}
