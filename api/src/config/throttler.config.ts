import { ConfigService } from '@nestjs/config';
import { minutes, ThrottlerModuleOptions } from '@nestjs/throttler';

const DEFAULT_TTL_MS = minutes(1);
const DEFAULT_LIMIT = 100;

export const AUTH_THROTTLE = {
  default: { ttl: minutes(1), limit: 5 },
};

function toPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function buildThrottlerOptions(
  config: ConfigService,
): ThrottlerModuleOptions {
  return {
    throttlers: [
      {
        name: 'default',
        ttl: toPositiveInt(config.get<string>('THROTTLE_TTL'), DEFAULT_TTL_MS),
        limit: toPositiveInt(
          config.get<string>('THROTTLE_LIMIT'),
          DEFAULT_LIMIT,
        ),
      },
    ],
  };
}
