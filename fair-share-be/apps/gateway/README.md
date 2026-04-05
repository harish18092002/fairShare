# FairShare API Gateway

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                  │
│  POST /api/gateway                                              │
│  Header:  x-action: GT_AUTH_LOGIN                               │
│  Body:    { "email": "...", "password": "..." }                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP :3000
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (:3000)                          │
│                                                                 │
│  1. ActionThrottlerGuard                                        │
│     reads x-action header                                       │
│     resolves tier from ACTIONS_REGISTRY                         │
│     enforces per-(IP, action) rate limit                        │
│                                                                 │
│  2. GatewayController  POST /api/gateway                        │
│     extracts x-action + body                                    │
│                                                                 │
│  3. GatewayService.dispatch()                                   │
│     strips GT_ prefix  →  AUTH_LOGIN                            │
│     looks up ACTIONS_REGISTRY  →  AUTH_SERVICE                  │
│     sends via ClientProxy.send('AUTH_LOGIN', payload)           │
│                                                                 │
└────────────┬────────────────┬───────────────────────────────────┘
             │ TCP            │ TCP              │ TCP
             ▼                ▼                  ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐
    │ AUTH :3011  │  │ BILLS :3012  │  │ ANALYTICS :3013  │
    │             │  │              │  │                  │
    │ @MessagePat │  │ @MessagePat  │  │ @MessagePat      │
    │ AUTH_LOGIN  │  │ BILLS_CREATE │  │ ANALYTICS_SUMM.. │
    │ AUTH_SIGNUP │  │ BILLS_GET    │  │ ANALYTICS_TREND  │
    │ AUTH_LOGOUT │  │ BILLS_LIST   │  │                  │
    │ AUTH_PROFIL │  │ BILLS_DELETE │  │                  │
    │             │  │ BILLS_ASSIGN │  │                  │
    │ HTTP :3001  │  │ HTTP :3002   │  │ HTTP :3003       │
    └─────────────┘  └──────────────┘  └──────────────────┘
```

---

## How It Works — Step by Step

### Step 1 — Client sends a request

The client makes a single HTTP call to the gateway with:
- **URL**: `POST /api/gateway` (the only non-health endpoint)
- **Header**: `x-action: GT_<ACTION_NAME>` — tells the gateway what to do
- **Body**: any JSON payload the action requires

```http
POST http://localhost:3000/api/gateway
x-action: GT_AUTH_LOGIN
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123"
}
```

### Step 2 — ActionThrottlerGuard runs

Before the request reaches the controller, the guard:

1. Reads `x-action: GT_AUTH_LOGIN`
2. Strips `GT_` → `AUTH_LOGIN`
3. Looks up `AUTH_LOGIN` in `ACTIONS_REGISTRY` → tier `auth`
4. Applies the `auth` tier limit: **10 req/min per IP**
5. Returns `429 Too Many Requests` if exceeded

The tracker key is `<real-ip>:<action>`, so each action has its **own independent bucket** per client IP. Hitting `GT_AUTH_LOGIN` 10 times does not consume the `GT_BILLS_CREATE` quota.

### Step 3 — GatewayService dispatches

```typescript
// action = 'AUTH_LOGIN'
// meta   = { service: 'AUTH_SERVICE', tier: 'auth' }
client.send('AUTH_LOGIN', { email, password })
```

The message is sent over **NestJS TCP transport** to the Auth service on port 3011.

### Step 4 — Auth service handles the message

```typescript
@MessagePattern('AUTH_LOGIN')
login(@Payload() data: { email: string; password: string }) {
  return this.appService.login(data);
}
```

The response travels back through TCP → GatewayService → HTTP response to the client.

---

## Naming Convention

| Layer      | Format           | Example              |
|------------|------------------|----------------------|
| Client     | `GT_ACTION_NAME` | `GT_AUTH_LOGIN`      |
| Gateway    | strips `GT_`     | `AUTH_LOGIN`         |
| Service    | `@MessagePattern`| `'AUTH_LOGIN'`       |

The `GT_` prefix (Gateway Token) distinguishes gateway-exposed actions from internal patterns and prevents clients from calling arbitrary message patterns.

---

## Rate Limiting

| Tier        | Limit      | Applied To                          |
|-------------|------------|-------------------------------------|
| `auth`      | 10 req/min | All `GT_AUTH_*` actions             |
| `bills`     | 30 req/min | All `GT_BILLS_*` actions            |
| `analytics` | 60 req/min | All `GT_ANALYTICS_*` actions        |
| `default`   | 100 req/min | Any unlisted / unknown action      |

- Tracked per `(client IP, action)` pair — independent buckets per action
- Proxy-aware: reads `X-Forwarded-For` → `X-Real-IP` → `req.ip`
- Returns `HTTP 429` on breach

---

## Registered Actions

| x-action header          | Routes to         | @MessagePattern       | Rate Tier  |
|--------------------------|-------------------|-----------------------|------------|
| `GT_AUTH_SIGNUP`         | AUTH_SERVICE:3011 | `AUTH_SIGNUP`         | auth       |
| `GT_AUTH_LOGIN`          | AUTH_SERVICE:3011 | `AUTH_LOGIN`          | auth       |
| `GT_AUTH_LOGOUT`         | AUTH_SERVICE:3011 | `AUTH_LOGOUT`         | auth       |
| `GT_AUTH_PROFILE`        | AUTH_SERVICE:3011 | `AUTH_PROFILE`        | auth       |
| `GT_BILLS_CREATE`        | BILL_SERVICE:3012 | `BILLS_CREATE`        | bills      |
| `GT_BILLS_GET`           | BILL_SERVICE:3012 | `BILLS_GET`           | bills      |
| `GT_BILLS_LIST`          | BILL_SERVICE:3012 | `BILLS_LIST`          | bills      |
| `GT_BILLS_DELETE`        | BILL_SERVICE:3012 | `BILLS_DELETE`        | bills      |
| `GT_BILLS_ASSIGN`        | BILL_SERVICE:3012 | `BILLS_ASSIGN`        | bills      |
| `GT_CONTRIBUTIONS_TOGGLE`| BILL_SERVICE:3012 | `CONTRIBUTIONS_TOGGLE`| bills      |
| `GT_ANALYTICS_SUMMARY`   | ANALYTICS_SERVICE:3013 | `ANALYTICS_SUMMARY` | analytics |
| `GT_ANALYTICS_TRENDS`    | ANALYTICS_SERVICE:3013 | `ANALYTICS_TRENDS`  | analytics |

---

## Port Map

| Service            | HTTP Port | TCP Port |
|--------------------|-----------|----------|
| Gateway            | 3000      | —        |
| Authentication     | 3001      | 3011     |
| Bill Management    | 3002      | 3012     |
| Analytics          | 3003      | 3013     |

Services are **hybrid apps**: HTTP for direct access and health checks, TCP for gateway communication.

---

## API Endpoints

### `POST /api/gateway` — Main dispatch endpoint

| Field   | Value                                      |
|---------|--------------------------------------------|
| Method  | POST                                       |
| URL     | `http://localhost:3000/api/gateway`        |
| Header  | `x-action: GT_<ACTION_NAME>`              |
| Body    | JSON payload (action-specific)            |

**Success response**: `200 OK` with the microservice's return value.

**Error responses**:

```json
// Missing or unknown x-action
{ "statusCode": 400, "message": "Unknown action 'GT_UNKNOWN'. Valid actions: ..." }

// Rate limit breached
{ "statusCode": 429, "message": "ThrottlerException: Too Many Requests" }

// Service down or timeout
{ "statusCode": 503, "message": "AUTH_SERVICE timed out" }
```

### `GET /api/health` — Gateway health (no rate limit)

```json
{
  "status": "ok",
  "timestamp": "2026-04-05T14:30:00.000Z",
  "service": "FairShare API Gateway",
  "endpoint": "POST /api/gateway  +  x-action: <GT_ACTION>",
  "registeredActions": ["GT_AUTH_SIGNUP", "GT_AUTH_LOGIN", "..."]
}
```

---

## File Structure

```
src/
├── config/
│   └── actions.registry.ts        # Action → { service, tier } + rate limit tiers
├── common/
│   └── guards/
│       └── action-throttler.guard.ts  # Per-action, proxy-aware rate limiting
├── gateway/
│   ├── gateway.controller.ts      # POST /gateway — reads x-action + body
│   ├── gateway.service.ts         # TCP dispatch logic
│   └── gateway.module.ts          # ClientsModule TCP registration
├── app.module.ts                  # ThrottlerModule + APP_GUARD + GatewayModule
├── app.controller.ts              # /health only
└── main.ts
```

---

## Running the Services

```bash
# Start gateway (watch mode)
npx nx serve gateway

# Start auth service (watch mode) — exposes HTTP:3001 + TCP:3011
npx nx serve authentication
```

---

## Adding a New Action

**Step 1** — Add to `config/actions.registry.ts`:
```typescript
PAYMENTS_CREATE: { service: 'PAYMENTS_SERVICE', tier: 'bills' },
```

**Step 2** — Add `@MessagePattern` in the target service controller:
```typescript
@MessagePattern('PAYMENTS_CREATE')
createPayment(@Payload() data: CreatePaymentDto) {
  return this.paymentsService.create(data);
}
```

**Step 3** — If it's a new service, register its TCP client in `gateway/gateway.module.ts` and inject it in `gateway.service.ts`.

That's it. No other gateway files change.

---

## Environment Variables

| Variable                  | Default     | Description                  |
|---------------------------|-------------|------------------------------|
| `AUTH_SERVICE_HOST`       | `localhost` | Auth service hostname        |
| `AUTH_SERVICE_TCP_PORT`   | `3011`      | Auth service TCP port        |
| `BILL_SERVICE_HOST`       | `localhost` | Bill service hostname        |
| `BILL_SERVICE_TCP_PORT`   | `3012`      | Bill service TCP port        |
| `ANALYTICS_SERVICE_HOST`  | `localhost` | Analytics service hostname   |
| `ANALYTICS_SERVICE_TCP_PORT` | `3013`  | Analytics service TCP port   |

---

## Related Services

- [Authentication Service](../authentication/README.md)
- [Bill Management Service](../bill-management/README.md)
- [Analytics Service](../analytics/README.md)
