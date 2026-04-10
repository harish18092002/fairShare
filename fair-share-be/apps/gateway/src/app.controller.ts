import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ACTIONS_REGISTRY } from './config/actions.registry';

@Controller()
export class AppController {
  @Get('health')
  @SkipThrottle()
  healthCheck() {
    const actions = Object.keys(ACTIONS_REGISTRY).map((a) => `GT_${a}`);
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'FairShare API Gateway',
      endpoint: 'POST /api/gateway  +  x-action: <GT_ACTION>',
      registeredActions: actions,
    };
  }
}
