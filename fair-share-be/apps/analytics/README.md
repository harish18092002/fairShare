# Analytics Service

## Overview

The Analytics Service provides personalized financial insights and reporting for users. It aggregates data from bills and contributions to generate real-time analytics including spending patterns, payment status, and financial summaries.

## Port

**3003** - Analytics service endpoint

## Tech Stack

- **Framework**: NestJS
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (read-only queries to bills DB)
- **Caching**: Redis (optional, for performance)
- **Aggregation**: SQL aggregate functions
- **Language**: TypeScript
- **Runtime**: Node.js

## Responsibilities

1. **User Analytics** - Generate personalized financial insights
2. **Bill Aggregation** - Summarize all user bills
3. **Payment Tracking** - Track pending and paid contributions
4. **Spending Analysis** - Calculate monthly/yearly spending
5. **Contribution Summary** - Highest bills, average spending
6. **Real-time Updates** - Refresh analytics on payment status changes

## API Routes

### 1. Get User Analytics
```
GET /api/analytics
```

**Purpose**: Fetch comprehensive analytics for authenticated user

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "userId": "user-uuid",
  "summary": {
    "totalBills": 45,
    "totalSpent": 2450.75,
    "totalPending": 325.50,
    "totalPaid": 2125.25,
    "averageBillAmount": 54.46,
    "highestBill": 185.00,
    "lowestBill": 12.50
  },
  "thisMonth": {
    "billCount": 8,
    "totalSpent": 425.00,
    "paidAmount": 350.00,
    "pendingAmount": 75.00,
    "averagePerBill": 53.13
  },
  "recentBills": [
    {
      "id": "bill-uuid-1",
      "totalAmount": 125.50,
      "myContribution": 42.00,
      "isPaid": true,
      "createdAt": "2026-03-05T10:30:00.000Z"
    },
    {
      "id": "bill-uuid-2",
      "totalAmount": 85.00,
      "myContribution": 28.50,
      "isPaid": false,
      "createdAt": "2026-03-06T15:20:00.000Z"
    }
  ],
  "pendingPayments": [
    {
      "billId": "bill-uuid-2",
      "amount": 28.50,
      "dueDate": "2026-03-15T00:00:00.000Z",
      "daysOverdue": 0
    },
    {
      "billId": "bill-uuid-3",
      "amount": 47.00,
      "dueDate": "2026-03-10T00:00:00.000Z",
      "daysOverdue": -3
    }
  ],
  "topContributions": [
    {
      "billId": "bill-uuid-5",
      "amount": 85.00,
      "billTotal": 250.00,
      "percentage": 34.0,
      "date": "2026-02-28T12:00:00.000Z"
    }
  ],
  "monthlyTrend": [
    {
      "month": "2026-01",
      "totalSpent": 380.00,
      "billCount": 7
    },
    {
      "month": "2026-02",
      "totalSpent": 520.00,
      "billCount": 10
    },
    {
      "month": "2026-03",
      "totalSpent": 425.00,
      "billCount": 8
    }
  ]
}
```

**Query Parameters** (Optional):
```
?startDate=2026-01-01
&endDate=2026-03-31
&includeDeleted=false
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: User not found

---

## Analytics Calculations

### 1. Total Spent
```sql
SELECT SUM(amount) as total_spent
FROM contributions
WHERE user_id = :userId
AND is_paid = true
```

### 2. Pending Payments
```sql
SELECT SUM(amount) as total_pending
FROM contributions
WHERE user_id = :userId
AND is_paid = false
```

### 3. This Month Spending
```sql
SELECT 
  COUNT(*) as bill_count,
  SUM(amount) as total_spent,
  SUM(CASE WHEN is_paid THEN amount ELSE 0 END) as paid_amount,
  SUM(CASE WHEN NOT is_paid THEN amount ELSE 0 END) as pending_amount
FROM contributions c
JOIN bills b ON c.bill_id = b.id
WHERE c.user_id = :userId
AND EXTRACT(MONTH FROM b.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
AND EXTRACT(YEAR FROM b.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
```

### 4. Highest Contribution
```sql
SELECT 
  c.bill_id,
  c.amount,
  b.total_amount as bill_total,
  (c.amount / b.total_amount * 100) as percentage
FROM contributions c
JOIN bills b ON c.bill_id = b.id
WHERE c.user_id = :userId
ORDER BY c.amount DESC
LIMIT 1
```

### 5. Monthly Trend
```sql
SELECT 
  TO_CHAR(b.created_at, 'YYYY-MM') as month,
  SUM(c.amount) as total_spent,
  COUNT(DISTINCT b.id) as bill_count
FROM contributions c
JOIN bills b ON c.bill_id = b.id
WHERE c.user_id = :userId
AND b.created_at >= NOW() - INTERVAL '6 months'
GROUP BY TO_CHAR(b.created_at, 'YYYY-MM')
ORDER BY month DESC
```

---

## Database Schema (Read-Only Access)

The Analytics service queries the Bill Management database in read-only mode:

### Views for Analytics

```typescript
// Create materialized view for better performance
CREATE MATERIALIZED VIEW user_analytics_summary AS
SELECT 
  c.user_id,
  COUNT(DISTINCT b.id) as total_bills,
  SUM(c.amount) as total_spent,
  SUM(CASE WHEN c.is_paid THEN c.amount ELSE 0 END) as total_paid,
  SUM(CASE WHEN NOT c.is_paid THEN c.amount ELSE 0 END) as total_pending,
  AVG(c.amount) as average_contribution,
  MAX(c.amount) as highest_contribution,
  MIN(c.amount) as lowest_contribution
FROM contributions c
JOIN bills b ON c.bill_id = b.id
WHERE b.deleted_at IS NULL
GROUP BY c.user_id;

-- Refresh materialized view periodically
REFRESH MATERIALIZED VIEW user_analytics_summary;
```

---

## Implementation Guide

### 1. Project Structure

```
apps/analytics/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── analytics/
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts
│   │   ├── analytics.service.ts
│   │   └── analytics.repository.ts
│   ├── cache/
│   │   ├── cache.module.ts
│   │   └── cache.service.ts
│   ├── database/
│   │   ├── database.module.ts
│   │   └── views/
│   │       └── analytics-views.sql
│   └── dto/
│       └── analytics-query.dto.ts
└── README.md
```

### 2. Dependencies Installation

```bash
npm install drizzle-orm pg
npm install @nestjs/cache-manager cache-manager
npm install redis cache-manager-redis-store
npm install -D @types/cache-manager drizzle-kit
```

### 3. Environment Variables

```env
# Database (Read-Only Connection)
DATABASE_URL=postgresql://readonly_user:password@localhost:5432/fairshare_bills
DB_HOST=localhost
DB_PORT=5432
DB_USER=readonly_user
DB_PASSWORD=readonly_password
DB_NAME=fairshare_bills

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=3600  # 1 hour cache

# Service
PORT=3003
NODE_ENV=development

# Analytics
CACHE_ENABLED=true
MATERIALIZED_VIEW_REFRESH_INTERVAL=3600000  # 1 hour
```

### 4. Analytics Service Implementation

**analytics.service.ts**:
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AnalyticsRepository } from './analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(
    private analyticsRepository: AnalyticsRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getUserAnalytics(userId: string, options?: AnalyticsQueryDto) {
    const cacheKey = `analytics:${userId}:${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch analytics data
    const [
      summary,
      thisMonth,
      recentBills,
      pendingPayments,
      topContributions,
      monthlyTrend,
    ] = await Promise.all([
      this.analyticsRepository.getUserSummary(userId),
      this.analyticsRepository.getMonthlyStats(userId),
      this.analyticsRepository.getRecentBills(userId, 10),
      this.analyticsRepository.getPendingPayments(userId),
      this.analyticsRepository.getTopContributions(userId, 5),
      this.analyticsRepository.getMonthlyTrend(userId, 6),
    ]);

    const analytics = {
      userId,
      summary,
      thisMonth,
      recentBills,
      pendingPayments,
      topContributions,
      monthlyTrend,
    };

    // Cache for 1 hour
    await this.cacheManager.set(cacheKey, analytics, 3600);

    return analytics;
  }

  async invalidateUserCache(userId: string) {
    const keys = await this.cacheManager.store.keys();
    const userKeys = keys.filter(key => key.startsWith(`analytics:${userId}`));
    
    for (const key of userKeys) {
      await this.cacheManager.del(key);
    }
  }
}
```

### 5. Analytics Repository

**analytics.repository.ts**:
```typescript
import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { bills, contributions } from '../database/schema';

@Injectable()
export class AnalyticsRepository {
  constructor(private db: any) {}

  async getUserSummary(userId: string) {
    const result = await this.db
      .select({
        totalBills: sql<number>`COUNT(DISTINCT ${bills.id})`,
        totalSpent: sql<number>`COALESCE(SUM(${contributions.amount}), 0)`,
        totalPaid: sql<number>`COALESCE(SUM(CASE WHEN ${contributions.isPaid} THEN ${contributions.amount} ELSE 0 END), 0)`,
        totalPending: sql<number>`COALESCE(SUM(CASE WHEN NOT ${contributions.isPaid} THEN ${contributions.amount} ELSE 0 END), 0)`,
        averageBillAmount: sql<number>`COALESCE(AVG(${contributions.amount}), 0)`,
        highestBill: sql<number>`COALESCE(MAX(${contributions.amount}), 0)`,
        lowestBill: sql<number>`COALESCE(MIN(${contributions.amount}), 0)`,
      })
      .from(contributions)
      .leftJoin(bills, eq(contributions.billId, bills.id))
      .where(
        and(
          eq(contributions.userId, userId),
          sql`${bills.deletedAt} IS NULL`
        )
      );

    return result[0];
  }

  async getMonthlyStats(userId: string) {
    const result = await this.db
      .select({
        billCount: sql<number>`COUNT(DISTINCT ${bills.id})`,
        totalSpent: sql<number>`COALESCE(SUM(${contributions.amount}), 0)`,
        paidAmount: sql<number>`COALESCE(SUM(CASE WHEN ${contributions.isPaid} THEN ${contributions.amount} ELSE 0 END), 0)`,
        pendingAmount: sql<number>`COALESCE(SUM(CASE WHEN NOT ${contributions.isPaid} THEN ${contributions.amount} ELSE 0 END), 0)`,
        averagePerBill: sql<number>`COALESCE(AVG(${contributions.amount}), 0)`,
      })
      .from(contributions)
      .leftJoin(bills, eq(contributions.billId, bills.id))
      .where(
        and(
          eq(contributions.userId, userId),
          sql`EXTRACT(MONTH FROM ${bills.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE)`,
          sql`EXTRACT(YEAR FROM ${bills.createdAt}) = EXTRACT(YEAR FROM CURRENT_DATE)`,
          sql`${bills.deletedAt} IS NULL`
        )
      );

    return result[0];
  }

  async getRecentBills(userId: string, limit: number = 10) {
    return await this.db
      .select({
        id: bills.id,
        totalAmount: bills.totalAmount,
        myContribution: contributions.amount,
        isPaid: contributions.isPaid,
        createdAt: bills.createdAt,
      })
      .from(contributions)
      .leftJoin(bills, eq(contributions.billId, bills.id))
      .where(
        and(
          eq(contributions.userId, userId),
          sql`${bills.deletedAt} IS NULL`
        )
      )
      .orderBy(desc(bills.createdAt))
      .limit(limit);
  }
}
```

### 6. Cache Integration

**cache.module.ts**:
```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      ttl: parseInt(process.env.REDIS_TTL) || 3600,
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
```

---

## Running the Service

```bash
# Development
nx serve analytics

# Production build
nx build analytics

# Run with Redis
docker run -d -p 6379:6379 redis:alpine
nx serve analytics
```

## Testing

```bash
# Unit tests
nx test analytics

# E2E tests
nx e2e analytics-e2e

# Test analytics endpoint
curl -X GET http://localhost:3003/analytics \
  -H "Authorization: Bearer <jwt-token>"
```

## Performance Optimization

### 1. Materialized Views
```sql
-- Create materialized view
CREATE MATERIALIZED VIEW user_monthly_analytics AS
SELECT 
  c.user_id,
  TO_CHAR(b.created_at, 'YYYY-MM') as month,
  SUM(c.amount) as total_spent,
  COUNT(DISTINCT b.id) as bill_count
FROM contributions c
JOIN bills b ON c.bill_id = b.id
GROUP BY c.user_id, TO_CHAR(b.created_at, 'YYYY-MM');

-- Refresh every hour via cron
REFRESH MATERIALIZED VIEW user_monthly_analytics;
```

### 2. Redis Caching
- Cache analytics for 1 hour
- Invalidate on payment status change
- Use cache warming for frequent users

### 3. Database Indexing
```sql
CREATE INDEX idx_contributions_user_paid ON contributions(user_id, is_paid);
CREATE INDEX idx_bills_created_at ON bills(created_at);
CREATE INDEX idx_contributions_bill_user ON contributions(bill_id, user_id);
```

### 4. Query Optimization
- Use aggregate functions instead of multiple queries
- Batch queries with Promise.all
- Limit result sets appropriately

---

## Real-time Updates

### Event-Driven Architecture

When payment status changes in Bill Management service:

```typescript
// Bill Management Service emits event
eventEmitter.emit('contribution.paid', { userId, contributionId });

// Analytics Service listens
@OnEvent('contribution.paid')
async handleContributionPaid(payload: any) {
  await this.analyticsService.invalidateUserCache(payload.userId);
  await this.refreshMaterializedView();
}
```

---

## Security Considerations

1. **Read-Only Database User**: Analytics uses read-only DB credentials
2. **JWT Validation**: All endpoints require valid JWT
3. **User Isolation**: Users can only see their own analytics
4. **Rate Limiting**: Applied at gateway level
5. **Cache Security**: Redis password protection

---

## Monitoring & Logging

### Metrics to Track
- Cache hit rate
- Query execution time
- API response time
- Materialized view refresh time

### Logging
```typescript
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  async getUserAnalytics(userId: string) {
    const startTime = Date.now();
    
    try {
      const analytics = await this.fetchAnalytics(userId);
      const duration = Date.now() - startTime;
      
      this.logger.log(`Analytics fetched for user ${userId} in ${duration}ms`);
      
      return analytics;
    } catch (error) {
      this.logger.error(`Failed to fetch analytics for user ${userId}`, error);
      throw error;
    }
  }
}
```

---

## Future Enhancements

1. ⏳ Predictive analytics (spending forecasts)
2. ⏳ Comparative analytics (vs. group average)
3. ⏳ Export analytics to PDF/CSV
4. ⏳ Custom date range queries
5. ⏳ Spending categories and tags
6. ⏳ Budget tracking and alerts
7. ⏳ Data visualization endpoints
8. ⏳ Machine learning insights

---

## Related Documentation

- [Gateway Service](../gateway/README.md)
- [Authentication Service](../authentication/README.md)
- [Bill Management Service](../bill-management/README.md)
