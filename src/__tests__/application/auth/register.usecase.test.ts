import { RegisterUserUseCase } from '@/src/application/auth/register.usecase';
import { EmailAlreadyExistsError } from '@/src/domain/user/user.errors';
import type { IUserRepository } from '@/src/domain/user/user.repository';

// Mock repository implementation
const mockUserRepository: jest.Mocked<IUserRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
};

describe('RegisterUserUseCase', () => {
  const useCase = new RegisterUserUseCase(mockUserRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user successfully when email is unique', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null); // No existing user
    mockUserRepository.save.mockResolvedValue();

    const result = await useCase.execute({ email: 'new@test.com', password: 'password' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.email).toBe('new@test.com');
    }
    expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should return error if email already exists', async () => {
    // Simulate finding an existing user
    mockUserRepository.findByEmail.mockResolvedValue({
      userId: '1', email: 'existing@test.com', passwordHash: '...', role: 'user', createdAt: '', updatedAt: ''
    });

    const result = await useCase.execute({ email: 'existing@test.com', password: 'password' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(EmailAlreadyExistsError);
    }
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });
});
