# Gateway Service

## Overview

The API Gateway serves as the single entry point for all client requests in the FairShare application. It implements rate limiting, request routing, and acts as a reverse proxy to the backend microservices using RPC communication.

## Port

**3000** - Main gateway endpoint

## Tech Stack

```
Client → API Gateway (Port 3000) → Microservices
                ↓
         Rate Limiter
                ↓
         ┌──────┴──────┬──────────┬──────────┐
         ↓             ↓          ↓          ↓
   Authentication  Bill Mgmt  Analytics  (Future)
   (Port 3001)    (Port 3002) (Port 3003)
```

## Implementation

### 1. Gateway Bootstrap (`main.ts`)

The gateway initializes with the following configuration:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for cross-origin requests
  app.enableCors();

  // Set global API prefix (/api)
  app.setGlobalPrefix("api");

  await app.listen(3000);
}
```

**Key Features:**

- **CORS Enabled**: Allows frontend applications to make cross-origin requests
- **Global Prefix**: All routes are prefixed with `/api` (e.g., `/api/health`)
- **Port 3000**: Main entry point for all client requests

### 2. Rate Limiting Implementation (`app.module.ts`)

Rate limiting is implemented using `@nestjs/throttler` to protect backend services from abuse:

```typescript
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time window: 60 seconds
        limit: 10, // Max requests: 10 per window
      },
    ]),
  ],
})
export class AppModule {}
```

**Configuration:**

- **TTL (Time To Live)**: 60,000ms (60 seconds) - the time window for rate limiting
- **Limit**: 10 requests per TTL window
- **Scope**: Global default applied to all routes unless overridden

**How It Works:**

1. Tracks requests per IP address within the TTL window
2. Returns `429 Too Many Requests` when limit is exceeded
3. Resets counter after TTL expires

### 3. Controller-Level Rate Limiting (`app.controller.ts`)

Individual endpoints can override the global rate limit:

```typescript
@Controller()
export class AppController {
  @Get()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  getHello(): string {
    // Stricter limit: 3 requests per 60 seconds
    return this.appService.getHello();
  }

  @Get("health")
  healthCheck() {
    // Uses global rate limit (10 requests per 60 seconds)
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "API Gateway",
    };
  }
}
```

**Rate Limit Strategies:**

- **Root Endpoint (`/`)**: 3 requests per 60 seconds (stricter)
- **Health Check (`/health`)**: 10 requests per 60 seconds (global default)
- **Future Endpoints**: Can be customized per route using `@Throttle()` decorator

### 4. Microservice Routing (To Be Implemented)

The gateway will route requests to microservices using NestJS client proxies:

**Planned Structure:**

```typescript
// Future implementation
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3001 }
      },
      {
        name: 'BILL_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3002 }
      },
      {
        name: 'ANALYTICS_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3003 }
      }
    ])
  ]
})
```

**Routing Pattern:**

- `/api/auth/*` → Authentication Service (Port 3001)
- `/api/bills/*` → Bill Management Service (Port 3002)
- `/api/analytics/*` → Analytics Service (Port 3003)

## Running the Service

```bash
# Development mode
nx serve gateway

# Production build
nx build gateway

# Run production build
node dist/apps/gateway/main.js
```

## API Endpoints

### Current Endpoints

| Endpoint      | Method | Rate Limit | Description   |
| ------------- | ------ | ---------- | ------------- |
| `/api/`       | GET    | 3/60s      | Root endpoint |
| `/api/health` | GET    | 10/60s     | Health check  |

### Health Check Response

```json
{
  "status": "ok",
  "timestamp": "2026-03-09T18:57:00.000Z",
  "service": "API Gateway"
}
```

## Rate Limiting Details

### Default Behavior

- **Algorithm**: Token bucket (via @nestjs/throttler)
- **Storage**: In-memory (default)
- **Tracking**: By IP address
- **Response**: HTTP 429 when limit exceeded

### Customizing Rate Limits

**Per-Route Override:**

```typescript
@Throttle({ default: { limit: 5, ttl: 30000 } })
@Get('custom-endpoint')
customEndpoint() {
  // 5 requests per 30 seconds
}
```

**Skip Rate Limiting:**

```typescript
@SkipThrottle()
@Get('unlimited')
unlimitedEndpoint() {
  // No rate limiting
}
```

**Future Enhancements:**

- Redis-based storage for distributed rate limiting
- Per-user rate limits (after authentication)
- Different limits for authenticated vs. anonymous users
- Rate limit headers in responses (`X-RateLimit-Limit`, `X-RateLimit-Remaining`)

## Environment Configuration

Create `.env` file in the gateway directory:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=10
```

## Error Handling

**Rate Limit Exceeded:**

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

## Next Steps

1. **Add Microservice Clients**: Implement TCP/gRPC clients for each microservice
2. **Create Route Controllers**: Add dedicated controllers for auth, bills, analytics
3. **Implement Guards**: Add authentication guards for protected routes
4. **Add Logging**: Implement request/response logging middleware
5. **Redis Integration**: Move rate limiting to Redis for distributed systems
6. **API Documentation**: Add Swagger/OpenAPI documentation
7. **Error Handling**: Implement global exception filters
8. **Request Validation**: Add DTOs and validation pipes

## Related Services

- [Authentication Service](../authentication/README.md)
- [Bill Management Service](../bill-management/README.md)
- [Analytics Service](../analytics/README.md)
