/**
 * Actions Registry
 *
 * Single source of truth that maps every action name (what the microservice
 * exposes as a @MessagePattern) to:
 *   - which NestJS ClientProxy injection token to use
 *   - which rate-limit tier to enforce at the gateway
 *
 * Gateway header convention:
 *   Client sends  →  x-action: GT_<ACTION_NAME>
 *   Gateway reads →  <ACTION_NAME>  →  looks up this registry
 *
 * To add a new action:
 *   1. Add an entry here.
 *   2. Add a @MessagePattern('<ACTION_NAME>') handler in the target service.
 *   Done. No other gateway files need to change.
 */

export interface ActionMeta {
  service: string;
  tier: "auth" | "bills" | "analytics" | "default";
}

export const ACTIONS_REGISTRY: Record<string, ActionMeta> = {
  // ── Authentication Service
  AUTH_SIGNUP: { service: "AUTH_SERVICE", tier: "auth" },
  AUTH_LOGIN: { service: "AUTH_SERVICE", tier: "auth" },
  AUTH_LOGOUT: { service: "AUTH_SERVICE", tier: "auth" },
  AUTH_PROFILE: { service: "AUTH_SERVICE", tier: "auth" },

  // ── Bill Management Service
  BILLS_CREATE: { service: "BILL_SERVICE", tier: "bills" },
  BILLS_GET: { service: "BILL_SERVICE", tier: "bills" },
  BILLS_LIST: { service: "BILL_SERVICE", tier: "bills" },
  BILLS_DELETE: { service: "BILL_SERVICE", tier: "bills" },
  BILLS_ASSIGN: { service: "BILL_SERVICE", tier: "bills" },
  CONTRIBUTIONS_TOGGLE: { service: "BILL_SERVICE", tier: "bills" },

  // ── Analytics Service
  ANALYTICS_SUMMARY: { service: "ANALYTICS_SERVICE", tier: "analytics" },
  ANALYTICS_TRENDS: { service: "ANALYTICS_SERVICE", tier: "analytics" },
};

/**
 * Rate-limit tiers — consumed by ActionThrottlerGuard and ThrottlerModule.
 *
 * auth      : 10 req/min — strict, prevents brute-force on login/signup
 * bills     : 30 req/min — moderate, covers CRUD and file uploads
 * analytics : 60 req/min — generous, read-heavy dashboard queries
 * default   : 100 req/min — safety net for unknown/unlisted actions
 */
export const RATE_LIMIT_TIERS: Record<string, { ttl: number; limit: number }> =
  {
    auth: { ttl: 60_000, limit: 10 },
    bills: { ttl: 60_000, limit: 30 },
    analytics: { ttl: 60_000, limit: 60 },
    default: { ttl: 60_000, limit: 100 },
  };
