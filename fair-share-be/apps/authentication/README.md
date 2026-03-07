# Authentication Service

## Overview

The Authentication Service handles all user authentication and authorization operations for the FairShare application. It manages user registration, login, JWT token generation, and user session management.

## Port

**3001** - Authentication service endpoint

## Tech Stack

- **Framework**: NestJS
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: class-validator, class-transformer
- **Language**: TypeScript
- **Runtime**: Node.js

## Responsibilities

1. **User Registration** - Create new user accounts
2. **User Authentication** - Validate credentials and issue tokens
3. **Password Management** - Secure password hashing and validation
4. **JWT Token Management** - Generate and validate access tokens
5. **User Profile Management** - Basic user information CRUD

## API Routes

### 1. User Signup
```
POST /api/auth/signup
```

**Purpose**: Register a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-03-07T07:43:00.000Z"
  },
  "accessToken": "jwt-token-here"
}
```

**Validation Rules**:
- Email: Valid email format, unique
- Password: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number
- Name: Required, 2-50 characters

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email already exists

---

### 2. User Login
```
POST /api/auth/login
```

**Purpose**: Authenticate existing user and issue JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "accessToken": "jwt-token-here"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `404 Not Found`: User not found

---

## Database Schema (Drizzle ORM)

### Users Table

```typescript
import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

**Indexes**:
- Primary Key: `id`
- Unique Index: `email`

---

## Implementation Guide

### 1. Project Structure

```
apps/authentication/
├── src/
│   ├── main.ts                    # Bootstrap file
│   ├── app.module.ts              # Root module
│   ├── auth/
│   │   ├── auth.module.ts         # Auth module
│   │   ├── auth.controller.ts     # Auth endpoints
│   │   ├── auth.service.ts        # Auth business logic
│   │   ├── dto/
│   │   │   ├── signup.dto.ts      # Signup validation
│   │   │   └── login.dto.ts       # Login validation
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts  # JWT guard
│   │   └── strategies/
│   │       └── jwt.strategy.ts    # JWT strategy
│   ├── users/
│   │   ├── users.module.ts        # Users module
│   │   ├── users.service.ts       # User CRUD operations
│   │   └── users.repository.ts    # Drizzle queries
│   ├── database/
│   │   ├── database.module.ts     # DB connection
│   │   ├── schema.ts              # Drizzle schema
│   │   └── migrations/            # DB migrations
│   └── common/
│       ├── filters/               # Exception filters
│       └── interceptors/          # Response interceptors
├── drizzle.config.ts              # Drizzle configuration
└── README.md                      # This file
```

### 2. Dependencies Installation

```bash
npm install drizzle-orm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt class-validator class-transformer
npm install -D @types/pg @types/bcrypt @types/passport-jwt drizzle-kit
```

### 3. Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fairshare_auth
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=fairshare_auth

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# Service
PORT=3001
NODE_ENV=development
```

### 4. Drizzle Configuration

**drizzle.config.ts**:
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schema.ts',
  out: './src/database/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### 5. Database Schema Implementation

**src/database/schema.ts**:
```typescript
import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### 6. DTOs (Data Transfer Objects)

**dto/signup.dto.ts**:
```typescript
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
}
```

**dto/login.dto.ts**:
```typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

### 7. Auth Service Implementation

**auth.service.ts**:
```typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.usersService.findByEmail(signupDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const user = await this.usersService.create({
      ...signupDto,
      password: hashedPassword,
    });

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), accessToken: token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), accessToken: token };
  }

  private generateToken(user: any): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    const { password, ...result } = user;
    return result;
  }
}
```

### 8. Database Migrations

```bash
# Generate migration
npx drizzle-kit generate:pg

# Run migration
npx drizzle-kit push:pg
```

## Running the Service

```bash
# Development
nx serve authentication

# Production build
nx build authentication

# Run migrations
npm run migration:run

# Generate migration
npm run migration:generate
```

## Testing

```bash
# Unit tests
nx test authentication

# E2E tests
nx e2e authentication-e2e

# Test coverage
nx test authentication --coverage
```

### Test Examples

```bash
# Test signup
curl -X POST http://localhost:3001/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "name": "Test User"
  }'

# Test login
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

## Security Best Practices

1. **Password Hashing**: Uses bcrypt with salt rounds of 10
2. **JWT Tokens**: Signed with secret key, configurable expiration
3. **Input Validation**: All inputs validated using class-validator
4. **SQL Injection Prevention**: Drizzle ORM prevents SQL injection
5. **Rate Limiting**: Applied at gateway level
6. **HTTPS Only**: In production, enforce HTTPS

## Error Handling

### Common Errors

| Status Code | Error | Description |
|------------|-------|-------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid credentials |
| 409 | Conflict | Email already exists |
| 500 | Internal Server Error | Server error |

## Performance Considerations

1. **Database Indexing**: Email field indexed for fast lookups
2. **Password Hashing**: Async bcrypt to avoid blocking
3. **Connection Pooling**: PostgreSQL connection pool
4. **Caching**: Consider Redis for session management (future)

## Monitoring

### Health Check
```typescript
@Get('health')
healthCheck() {
  return { status: 'ok', service: 'authentication' };
}
```

## Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY dist/apps/authentication ./
EXPOSE 3001
CMD ["node", "main.js"]
```

## Future Enhancements

1. ⏳ Email verification
2. ⏳ Password reset functionality
3. ⏳ OAuth integration (Google, Facebook)
4. ⏳ Two-factor authentication (2FA)
5. ⏳ Session management with Redis
6. ⏳ Refresh token mechanism
7. ⏳ User roles and permissions

## Related Documentation

- [Gateway Service](../gateway/README.md)
- [Bill Management Service](../bill-management/README.md)
- [Analytics Service](../analytics/README.md)
