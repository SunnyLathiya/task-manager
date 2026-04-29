# 🚀 Taskly: Enterprise-Grade Serverless Backend & Premium Demo

A high-performance, production-ready Task Management platform. This project demonstrates a **robust Serverless Backend** built with **Clean Architecture (DDD)**, deployed on **AWS**, and showcased through a premium **Next.js Frontend**.

![Backend Architecture](https://img.shields.io/badge/Architecture-DDD_%2F_Clean_Code-blue?style=for-the-badge)
![Cloud](https://img.shields.io/badge/Cloud-AWS_Lambda_&_DynamoDB-orange?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-JWT_&_Joi_Validation-green?style=for-the-badge)

---

## 🛠️ Backend Architecture & Principles

This project is built as a **Showcase of Backend Engineering Excellence**:

- **Domain-Driven Design (DDD)**: Strict separation of concerns between Domain, Application, and Infrastructure layers.
- **Serverless First**: Optimized for cost and scalability using AWS Lambda, API Gateway, and DynamoDB.
- **Strict Validation**: Industry-standard **Joi** validation for every API request to ensure data integrity.
- **NoSQL Performance**: Specialized DynamoDB modeling using **Global Secondary Indexes (GSIs)** for O(1) lookups on both User and Task contexts.
- **Security**: JWT-based stateless authentication with secure password hashing via **Bcrypt**.

---

## 📂 Project Structure

| Directory | Responsibility |
| :--- | :--- |
| **`src/domain`** | **Pure Business Logic**: Entities, Value Objects, and Repository Interfaces. Zero external dependencies. |
| **`src/application`** | **Orchestration**: Use-cases that coordinate domain logic and infrastructure (e.g., `UpdateTask`, `RegisterUser`). |
| **`src/infrastructure`** | **Implementation**: Concrete DynamoDB repositories, third-party clients, and schema definitions. |
| **`handler.ts`** | **Entry Point**: Ultra-optimized Lambda router, bundled with **ESBuild** for minimal cold starts. |
| **`serverless.yml`** | **Infrastructure as Code (IaC)**: Fully automated provisioning of tables, IAM roles, and indices. |

---

## 🛠️ Setup & Deployment

### 1. Prerequisites
- **Node.js**: `v20.x`
- **Package Manager**: `pnpm`
- **AWS CLI**: Configured with deployment credentials.

### 2. Installation
```bash
pnpm install
```

### 3. Environment Configuration
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Open `.env` and provide:
- `JWT_SECRET`: Secret key for JWT signing.
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`: AWS credentials.

### 4. Deployment
**Backend (AWS):**
```bash
pnpm run deploy
```
**Frontend Showcase (Vercel):**
- Deploy to Vercel and set `NEXT_PUBLIC_API_URL` to your new AWS endpoint.

---

## 📡 API Reference & Testing (Postman)

### 1. Authentication
- `POST /api/auth/register` - `{ email, password }`
- `POST /api/auth/login` - Returns Bearer JWT.

### 2. Task Management (Protected)
*Requires `Authorization: Bearer <token>`*
- `GET /api/tasks` - List all tasks for user.
- `POST /api/tasks` - Create a new task.
- `PUT /api/tasks/{id}` - Update task details or status.
- `DELETE /api/tasks/{id}` - Delete task.

### 🧪 How to Test:
1. **Register/Login**: Use Postman to call the auth endpoints.
2. **Authorize**: Copy the `token` from the login response.
3. **Set Header**: In Postman, go to **Auth** -> **Bearer Token** and paste the token.
4. **Interact**: Call any task endpoint to see the per-user data isolation in action.

---

## ✨ Frontend Showcase (Demo UI)
While the core of this project is the backend, a premium frontend is included to demonstrate the API's capabilities:
- **Glassmorphism UI**: Modern Dark Mode aesthetics.
- **Responsive**: Full mobile support with bottom-nav navigation.
- **State Management**: Clean interaction with the serverless API.

---

## 🧹 Cleanup
To remove all AWS resources (Tables, Lambdas, Logs):
```bash
npx serverless remove
```

---

Built with ❤️ by a Backend Engineer focused on Quality & Scalability.
