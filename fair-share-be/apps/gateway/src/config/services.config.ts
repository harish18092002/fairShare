export interface ServiceConfig {
  name: string;
  target: string;
  rateLimitTier: string;
}

export const SERVICES: Record<string, ServiceConfig> = {
  auth: {
    name: "AUTH_SERVICE",
    target: process.env.AUTH_SERVICE_URL ?? "http://localhost:3001",
    rateLimitTier: "auth",
  },
  bills: {
    name: "BILL_SERVICE",
    target: process.env.BILL_SERVICE_URL ?? "http://localhost:3002",
    rateLimitTier: "bills",
  },
  analytics: {
    name: "ANALYTICS_SERVICE",
    target: process.env.ANALYTICS_SERVICE_URL ?? "http://localhost:3003",
    rateLimitTier: "analytics",
  },
};

export const RATE_LIMIT_TIERS = [
  { name: "default", ttl: 60_000, limit: 100 },
  { name: "auth", ttl: 60_000, limit: 10 },
  { name: "bills", ttl: 60_000, limit: 30 },
  { name: "analytics", ttl: 60_000, limit: 60 },
];
