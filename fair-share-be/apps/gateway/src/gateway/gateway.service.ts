import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom, timeout, catchError, throwError } from "rxjs";
import { ACTIONS_REGISTRY } from "../config/actions.registry";

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    @Inject("AUTH_SERVICE") private readonly authClient: ClientProxy,
    @Inject("BILL_SERVICE") private readonly billClient: ClientProxy,
    @Inject("ANALYTICS_SERVICE") private readonly analyticsClient: ClientProxy,
  ) {}

  /**
   * Route a client request to the correct microservice.
   *
   * @param xAction  The raw header value, e.g. 'GT_AUTH_LOGIN'
   * @param payload  The request body forwarded as the message payload
   */
  async dispatch(xAction: string, payload: unknown): Promise<unknown> {
    const action = xAction?.replace(/^GT_/, "").trim().toUpperCase();

    if (!action) {
      throw new BadRequestException("Missing x-action header");
    }

    const meta = ACTIONS_REGISTRY[action];
    if (!meta) {
      throw new BadRequestException(
        `Unknown action '${xAction}'. ` +
          `Valid actions: ${Object.keys(ACTIONS_REGISTRY)
            .map((a) => `GT_${a}`)
            .join(", ")}`,
      );
    }

    const client = this.resolveClient(meta.service);
    this.logger.debug(`Dispatching ${action} → ${meta.service}`);

    return firstValueFrom(
      client.send<unknown>(action, payload ?? {}).pipe(
        timeout(10_000),
        catchError((err) => {
          if (err?.name === "TimeoutError") {
            return throwError(
              () =>
                new ServiceUnavailableException(`${meta.service} timed out`),
            );
          }
          return throwError(() => err);
        }),
      ),
    );
  }

  private resolveClient(service: string): ClientProxy {
    switch (service) {
      case "AUTH_SERVICE":
        return this.authClient;
      case "BILL_SERVICE":
        return this.billClient;
      case "ANALYTICS_SERVICE":
        return this.analyticsClient;
      default:
        throw new ServiceUnavailableException(
          `No client registered for ${service}`,
        );
    }
  }
}
