/**
 * DynamoDB table and GSI (Global Secondary Index) constants.
 * These are driven by environment variables for dev/staging/prod separation.
 */

export const TABLE_NAMES = {
  USERS: process.env.DYNAMODB_USERS_TABLE ?? 'task-manager-users-dev',
  TASKS: process.env.DYNAMODB_TASKS_TABLE ?? 'task-manager-tasks-dev',
} as const;

export const USERS_EMAIL_GSI = 'email-index';
export const TASKS_USER_GSI = 'userId-index';
