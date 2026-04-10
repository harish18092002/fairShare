import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerRequest } from "@nestjs/throttler";
import {
  ACTIONS_REGISTRY,
  RATE_LIMIT_TIERS,
} from "../../config/actions.registry";

/**
 * ActionThrottlerGuard
 *
 * Extends the default ThrottlerGuard with two behaviours:
 *
 * 1. Per-action rate limiting — reads the x-action header, resolves the action's
 *    tier from ACTIONS_REGISTRY, and enforces that tier's limit/ttl.
 *    Unknown actions fall back to the 'default' tier.
 *
 * 2. Proxy-aware IP extraction — checks X-Forwarded-For and X-Real-IP so that
 *    clients behind a load balancer are tracked by their real IP, not the
 *    proxy's IP.
 *
 * Tracker key format:  <real-ip>:<action>
 * This gives each (client, action) pair its own independent rate-limit bucket.
 */
@Injectable()
export class ActionThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const headers = req["headers"] as Record<string, string | string[]>;

    const forwarded = headers?.["x-forwarded-for"];
    const realIp = headers?.["x-real-ip"];
    const action = (headers?.["x-action"] as string) ?? "UNKNOWN";

    let ip: string;
    if (forwarded) {
      const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      ip = raw.split(",")[0].trim();
    } else if (realIp) {
      ip = Array.isArray(realIp) ? realIp[0] : realIp;
    } else {
      ip =
        (req["ip"] as string) ??
        (req["connection"] as { remoteAddress?: string })?.remoteAddress ??
        "unknown";
    }

    return `${ip}:${action}`;
  }

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const ctx = requestProps.context as ExecutionContext;
    const req = ctx.switchToHttp().getRequest<Record<string, unknown>>();
    const headers = req["headers"] as Record<string, string>;

    const xAction = headers?.["x-action"] ?? "";
    const action = xAction.replace(/^GT_/, "");

    const tierName = ACTIONS_REGISTRY[action]?.tier ?? "default";
    const tier = RATE_LIMIT_TIERS[tierName] ?? RATE_LIMIT_TIERS["default"];

    return super.handleRequest({
      ...requestProps,
      limit: tier.limit,
      ttl: tier.ttl,
    });
  }
}
