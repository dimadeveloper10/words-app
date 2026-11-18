import { Inject, Injectable } from '@nestjs/common';
import { Logger, PARAMS_PROVIDER_TOKEN, PinoLogger } from 'nestjs-pino';
import type { Params } from 'nestjs-pino';

const FRAMEWORK_CONTEXTS = new Set([
  'NestFactory',
  'InstanceLoader',
  'RoutesResolver',
  'RouterExplorer',
]);

@Injectable()
export class AppLogger extends Logger {
  constructor(
    logger: PinoLogger,
    @Inject(PARAMS_PROVIDER_TOKEN) params: Params,
  ) {
    super(logger, params);
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    const context = optionalParams.at(-1);
    if (typeof context === 'string' && FRAMEWORK_CONTEXTS.has(context)) {
      this.verbose(message, ...optionalParams);
      return;
    }
    super.log(message, ...optionalParams);
  }
}
