import { createUser, toUserPublicView } from '@/src/domain/user/user.entity';

describe('UserEntity Domain', () => {
  it('should normalize email to lowercase and trim whitespace', () => {
    const user = createUser({ email: '  USER@Example.COM  ', passwordHash: 'hash' });
    expect(user.email).toBe('user@example.com');
  });

  it('should generate a valid UUID v4 for the userId', () => {
    const user = createUser({ email: 'a@b.com', passwordHash: 'hash' });
    expect(user.userId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('should hide sensitive data when converting to public view', () => {
    const user = createUser({ email: 'test@test.com', passwordHash: 'secret_hash' });
    const publicView = toUserPublicView(user);
    
    expect(publicView).not.toHaveProperty('passwordHash');
    expect(publicView.email).toBe(user.email);
  });
});
