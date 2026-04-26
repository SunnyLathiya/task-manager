import { GetCommand, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from './client';
import { TABLE_NAMES, TASKS_USER_GSI } from './schema';
import type { ITaskRepository } from '@/src/domain/task/task.repository';
import type { TaskEntity, ListTasksFilter } from '@/src/domain/task/task.entity';

/**
 * DynamoDBTaskRepository — Implementation of ITaskRepository.
 */
export class DynamoDBTaskRepository implements ITaskRepository {
  async save(task: TaskEntity): Promise<void> {
    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAMES.TASKS,
        Item: task,
      }),
    );
  }

  async findById(taskId: string): Promise<TaskEntity | null> {
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAMES.TASKS,
        Key: { taskId },
      }),
    );
    return (result.Item as TaskEntity) ?? null;
  }

  async findByUserId(userId: string, filter?: ListTasksFilter): Promise<{ items: TaskEntity[]; nextKey?: string }> {
    const filterExpression = filter?.status ? '#status = :status' : undefined;

    const exclusiveStartKey = filter?.cursor
      ? JSON.parse(Buffer.from(filter.cursor, 'base64').toString('utf8'))
      : undefined;

    const result = await dynamoDb.send(
      new QueryCommand({
        TableName: TABLE_NAMES.TASKS,
        IndexName: TASKS_USER_GSI,
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: filterExpression,
        ExpressionAttributeValues: {
          ':userId': userId,
          ...(filter?.status && { ':status': filter.status }),
        },
        ...(filter?.status && { ExpressionAttributeNames: { '#status': 'status' } }),
        Limit: filter?.limit ?? 20,
        ExclusiveStartKey: exclusiveStartKey,
        ScanIndexForward: false, // Newest tasks first
      }),
    );

    const nextKey = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : undefined;

    return {
      items: (result.Items as TaskEntity[]) ?? [],
      nextKey,
    };
  }

  async update(task: TaskEntity): Promise<void> {
    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAMES.TASKS,
        Item: task,
        ConditionExpression: 'attribute_exists(taskId)',
      }),
    );
  }

  async delete(taskId: string, userId: string): Promise<void> {
    await dynamoDb.send(
      new DeleteCommand({
        TableName: TABLE_NAMES.TASKS,
        Key: { taskId },
        ConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
      }),
    );
  }
}
