import { GetCommand, PutCommand, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
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
    if (!userId) {
      return { items: [] };
    }
    let exclusiveStartKey;
    if (filter?.cursor) {
      try {
        const decoded = Buffer.from(filter.cursor, 'base64').toString('utf8');
        const parsed = JSON.parse(decoded);
        // Shape validation: must be an object with taskId and userId
        if (parsed && typeof parsed === 'object' && 'taskId' in parsed && 'userId' in parsed) {
          exclusiveStartKey = parsed;
        }
      } catch {
        // Silently ignore invalid cursor to prevent 500 crashes
      }
    }

    const queryInput: any = {
      TableName: TABLE_NAMES.TASKS,
      IndexName: TASKS_USER_GSI,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      // Cap the limit to a maximum of 100 to prevent DB overload
      Limit: Math.min(filter?.limit ?? 20, 100),
      ExclusiveStartKey: exclusiveStartKey,
      ScanIndexForward: false,
    };

    if (filter?.status) {
      queryInput.FilterExpression = '#status = :status';
      queryInput.ExpressionAttributeValues[':status'] = filter.status;
      queryInput.ExpressionAttributeNames = { '#status': 'status' };
    }

    const result = await dynamoDb.send(new QueryCommand(queryInput));

    const nextKey = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : undefined;

    return {
      items: (result.Items as TaskEntity[]) ?? [],
      nextKey,
    };
  }

  async update(task: TaskEntity): Promise<void> {
    const updateExpression = ['SET title = :title, #status = :status, updatedAt = :updatedAt'];
    const expressionAttributeValues: Record<string, any> = {
      ':title': task.title,
      ':status': task.status,
      ':updatedAt': task.updatedAt,
      ':userId': task.userId,
    };
    const expressionAttributeNames: Record<string, string> = {
      '#status': 'status',
    };

    if (task.description) {
      updateExpression[0] += ', description = :desc';
      expressionAttributeValues[':desc'] = task.description;
    } else {
      updateExpression.push('REMOVE description');
    }

    await dynamoDb.send(
      new UpdateCommand({
        TableName: TABLE_NAMES.TASKS,
        Key: { taskId: task.taskId },
        UpdateExpression: updateExpression.join(' '),
        ConditionExpression: 'attribute_exists(taskId) AND userId = :userId',
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
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
