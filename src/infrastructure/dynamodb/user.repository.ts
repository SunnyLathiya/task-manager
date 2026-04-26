import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from './client';
import { TABLE_NAMES, USERS_EMAIL_GSI } from './schema';
import type { IUserRepository } from '@/src/domain/user/user.repository';
import type { UserEntity } from '@/src/domain/user/user.entity';

/**
 * DynamoDBUserRepository — Implementation of IUserRepository.
 */
export class DynamoDBUserRepository implements IUserRepository {
  async findById(userId: string): Promise<UserEntity | null> {
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAMES.USERS,
        Key: { userId },
      }),
    );
    return (result.Item as UserEntity) ?? null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await dynamoDb.send(
      new QueryCommand({
        TableName: TABLE_NAMES.USERS,
        IndexName: USERS_EMAIL_GSI,
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email.toLowerCase().trim() },
        Limit: 1,
      }),
    );
    const items = result.Items as UserEntity[];
    return items?.[0] ?? null;
  }

  async save(user: UserEntity): Promise<void> {
    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAMES.USERS,
        Item: user,
        ConditionExpression: 'attribute_not_exists(userId)',
      }),
    );
  }
}
