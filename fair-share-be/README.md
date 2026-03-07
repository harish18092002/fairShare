# FairShare Backend - Microservices

This is an Nx monorepo containing four NestJS microservices for the FairShare application using an API Gateway pattern.

## Microservices

### 1. Gateway Service (API Gateway)

- **Port**: 3000
- **Purpose**: Single entry point, rate limiting, request routing to microservices
- **Tech**: NestJS, @nestjs/throttler
- **[Documentation](./apps/gateway/README.md)**

### 2. Authentication Service

- **Port**: 3001
- **Purpose**: User authentication, JWT token management, signup/login
- **Tech**: NestJS, Drizzle ORM, PostgreSQL, JWT, bcrypt
- **[Documentation](./apps/authentication/README.md)**

### 3. Bill Management Service

- **Port**: 3002
- **Purpose**: Bill upload, OCR processing, bill splitting, contribution tracking
- **Tech**: NestJS, Drizzle ORM, PostgreSQL, Tesseract.js, Multer, Sharp
- **[Documentation](./apps/bill-management/README.md)**

### 4. Analytics Service

- **Port**: 3003
- **Purpose**: User analytics, spending insights, payment tracking
- **Tech**: NestJS, Drizzle ORM, PostgreSQL, Redis
- **[Documentation](./apps/analytics/README.md)**

## Running the Services

### Prerequisites

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Setup PostgreSQL databases**

   ```bash
   # Create databases
   createdb fairshare_auth
   createdb fairshare_bills
   ```

3. **Setup Redis** (for Analytics service)

   ```bash
   docker run -d -p 6379:6379 redis:alpine
   ```

4. **Configure environment variables**
   - Copy `.env.example` to `.env` for each service
   - Update database credentials and secrets

### Run Individual Services

```bash
# Run API Gateway (Start this first)
nx serve gateway

# Run Authentication Service
nx serve authentication

# Run Bill Management Service
nx serve bill-management

# Run Analytics Service
nx serve analytics
```

### Run All Services

```bash
# In separate terminals
nx serve gateway
nx serve authentication
nx serve bill-management
nx serve analytics

# Or use concurrently (install: npm i -D concurrently)
npm run start:all
```

### Build Services

```bash
# Build Authentication Service
nx build authentication

# Build Bill Management Service
nx build bill-management

# Build Analytics Service
nx build analytics
```

### Build All Services

```bash
nx run-many --target=build --all
```

## Project Structure

```
fair-share-be/
├── apps/
│   ├── gateway/                    # API Gateway (Port 3000)
│   │   ├── src/
│   │   │   ├── main.ts            # Bootstrap with CORS & rate limiting
│   │   │   ├── app.module.ts      # ThrottlerModule configuration
│   │   │   ├── app.controller.ts  # Health check endpoints
│   │   │   └── app.service.ts
│   │   ├── project.json           # Nx configuration
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   └── README.md              # Gateway documentation
│   ├── authentication/             # Auth Service (Port 3001)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── auth/              # Auth module (signup, login)
│   │   │   ├── users/             # User management
│   │   │   └── database/          # Drizzle schema & migrations
│   │   ├── project.json
│   │   ├── drizzle.config.ts      # Drizzle configuration
│   │   └── README.md              # Auth documentation
│   ├── bill-management/            # Bill Service (Port 3002)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── bills/             # Bill upload & management
│   │   │   ├── items/             # Bill items
│   │   │   ├── contributions/     # Contribution tracking
│   │   │   ├── ocr/               # OCR processing
│   │   │   ├── storage/           # File storage
│   │   │   └── database/          # Drizzle schema & migrations
│   │   ├── project.json
│   │   ├── drizzle.config.ts
│   │   └── README.md              # Bill management documentation
│   └── analytics/                  # Analytics Service (Port 3003)
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── analytics/         # Analytics queries & aggregations
│       │   ├── cache/             # Redis caching
│       │   └── database/          # Read-only DB access
│       ├── project.json
│       └── README.md              # Analytics documentation
├── nx.json                         # Nx workspace configuration
├── tsconfig.base.json              # Base TypeScript config
├── package.json                    # Dependencies
└── README.md                       # This file
```

## Installation

```bash
npm install
```

## Technologies

- **NestJS**: Progressive Node.js framework for building scalable server-side applications
- **Nx**: Smart monorepo build system with caching and dependency graph
- **TypeScript**: Typed JavaScript for better developer experience
- **Drizzle ORM**: Lightweight TypeScript ORM for PostgreSQL
- **PostgreSQL**: Relational database for data persistence
- **Redis**: In-memory cache for analytics performance
- **JWT**: Secure token-based authentication
- **Tesseract.js**: OCR for bill text extraction
- **Multer**: File upload handling
- **Sharp**: Image processing and optimization

## API Routes Overview

### Gateway (Port 3000)

All routes are prefixed with `/api` and rate-limited.

### Authentication Routes (via Gateway)

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication

### Bill Management Routes (via Gateway)

- `POST /api/bills/upload` - Upload and process bill image
- `POST /api/bills/:billId/assign` - Assign bill items to users
- `PATCH /api/contributions/:id/toggle-paid` - Toggle payment status
- `GET /api/bills/:id` - Get bill details
- `DELETE /api/bills/:id` - Soft-delete bill

### Analytics Routes (via Gateway)

- `GET /api/analytics` - Get user analytics and insights

## Architecture Patterns

### 1. API Gateway Pattern

- Single entry point for all client requests
- Centralized rate limiting and authentication
- Request routing to appropriate microservices

### 2. Microservices Architecture

- Independent services with single responsibility
- Separate databases per service (future)
- RPC communication between services (to be implemented)

### 3. Database per Service

- Authentication: User credentials and profiles
- Bill Management: Bills, items, contributions
- Analytics: Read-only access to bills data + Redis cache

### 4. Event-Driven Updates

- Payment status changes trigger analytics cache invalidation
- Real-time updates across services (future)
