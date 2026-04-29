import { createUser, toUserPublicView } from '@/src/domain/user/user.entity';

describe('User Domain Entity', () => {
  it('should create a valid user entity', () => {
    const props = {
      email: 'test@example.com',
      passwordHash: 'hashed_password',
    };
    const user = createUser(props);

    expect(user.email).toBe('test@example.com');
    expect(user.passwordHash).toBe('hashed_password');
    expect(user.userId).toBeDefined();
    expect(user.createdAt).toBeDefined();
  });

  it('should map to public view correctly', () => {
    const user = createUser({
      email: 'Test@Example.Com',
      passwordHash: 'hashed',
    });
    
    const publicView = toUserPublicView(user);

    expect(publicView.id).toBe(user.userId);
    expect(publicView.email).toBe('test@example.com'); // Normalized
    expect(publicView.createdAt).toBe(user.createdAt);
    expect((publicView as any).passwordHash).toBeUndefined();
  });
});
