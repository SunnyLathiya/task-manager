# 🚀 Secure Task Manager API (Serverless)

A high-performance, production-ready Task Manager API built with **Next.js (API Routes)**, **TypeScript**, and **DynamoDB**. Deployed globally via **AWS Lambda** using the Serverless Framework.

## ✨ Features
- **Clean Architecture**: Follows Domain-Driven Design (DDD) principles.
- **JWT Authentication**: Secure user registration and login.
- **Full CRUD**: Create, read, update, and delete tasks with per-user isolation.
- **Optimized Performance**: Bundled with ESBuild for lightning-fast Lambda execution and small package size.
- **Production Grade**: Automated resource provisioning (IAM, DynamoDB, API Gateway).

---

## 🛠️ Setup & Deployment

### 1. Prerequisites
- **Node.js**: `v20.x` (See `.nvmrc`)
- **Package Manager**: `pnpm`
- **AWS Account**: Configured credentials with permissions for Lambda, DynamoDB, and CloudFormation.

### 2. Installation
```bash
pnpm install
```

### 3. Environment Configuration
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Open `.env` and provide your secrets:
- `JWT_SECRET`: A strong random string for token signing.
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`: Your deployment credentials.

### 4. Deploy to AWS
```bash
pnpm run deploy
```
This command will:
1. Bundle the application using ESBuild.
2. Provision DynamoDB tables and GSIs.
3. Deploy the API Gateway and Lambda functions to AWS.

---

## 📡 API Endpoints

Once deployed, your API will be available at your AWS Execute-API URL.

### Authentication
- `POST /api/auth/register` - Create a new account.
- `POST /api/auth/login` - Get a JWT token.

### Tasks (Protected - Requires Bearer Token)
- `GET /api/tasks` - List all tasks for the logged-in user.
- `POST /api/tasks` - Create a new task.
- `GET /api/tasks/{taskId}` - Get details of a specific task.
- `PUT /api/tasks/{taskId}` - Update a task.
- `DELETE /api/tasks/{taskId}` - Delete a task.

---

## 🧪 Testing with Postman

1. **Register**: Send a `POST` to `/api/auth/register` with `{ "email": "test@example.com", "password": "password123" }`.
2. **Login**: Send a `POST` to `/api/auth/login` with the same credentials. Copy the `token`.
3. **Authorize**: In Postman, go to the **Auth** tab, select **Bearer Token**, and paste your token.
4. **Manage Tasks**: You can now call any `/api/tasks` endpoint!

---

## 📂 Project Structure
- `src/domain`: Pure business logic and entities (No dependencies).
- `src/application`: Use-cases that orchestrate business logic.
- `src/infrastructure`: Data access (DynamoDB) and external services.
- `handler.ts`: The optimized entry point for AWS Lambda.
- `serverless.yml`: Infrastructure as Code (IaC) configuration.

---

## 🧹 Cleanup
To remove all provisioned resources from AWS:
```bash
npx serverless remove
```
