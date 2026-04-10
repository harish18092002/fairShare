import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Extends the default ThrottlerGuard to correctly resolve the client IP
 * when the gateway sits behind a reverse proxy or load balancer.
 *
 * Priority: X-Forwarded-For → X-Real-IP → req.ip → connection address
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const headers = req['headers'] as Record<string, string | string[]>;

    const forwarded = headers?.['x-forwarded-for'];
    if (forwarded) {
      const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return first.split(',')[0].trim();
    }

    const realIp = headers?.['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    return (
      (req['ip'] as string) ??
      ((req['connection'] as { remoteAddress?: string })?.remoteAddress) ??
      'unknown'
    );
  }
}
