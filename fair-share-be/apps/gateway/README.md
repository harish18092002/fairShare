# Gateway Service

## Overview

The API Gateway serves as the single entry point for all client requests in the FairShare application. It implements rate limiting, request routing, and acts as a reverse proxy to the backend microservices using RPC communication.

## Port

**3000** - Main gateway endpoint

## Tech Stack

- **Framework**: NestJS
- **Rate Limiting**: @nestjs/throttler
- **Communication**: gRPC/TCP for microservice communication
- **Language**: TypeScript
- **Runtime**: Node.js

## Architecture Role

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

## Features

### 1. Rate Limiting
- Protects backend services from abuse
- Configurable limits per endpoint
- Default: 10 requests per 60 seconds

### 2. Request Routing
- Routes requests to appropriate microservices
- Load balancing capabilities
- Health check endpoints

### 3. CORS Handling
- Enables cross-origin requests
- Configurable origins

### 4. Global API Prefix
- All routes prefixed with `/api`

## Running the Service

```bash
# Development
nx serve gateway

# Production build
nx build gateway
```

## Next Steps

1. ✅ Basic gateway setup with rate limiting
2. ⏳ Add microservice clients (TCP/gRPC)
3. ⏳ Implement route proxies for all services
4. ⏳ Add JWT authentication middleware
