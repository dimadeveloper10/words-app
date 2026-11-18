import { ConfigService } from '@nestjs/config';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Params } from 'nestjs-pino';
import { stdSerializers } from 'pino';

type RequestWithUser = IncomingMessage & {
  id?: unknown;
  user?: { id: string };
};

const IGNORED_PATH_PREFIXES = ['/docs', '/static/'];

function defaultLevel(nodeEnv: string): string {
  if (nodeEnv === 'test') {
    return 'silent';
  }
  if (nodeEnv === 'development') {
    return 'debug';
  }
  return 'info';
}

export function buildLoggerOptions(config: ConfigService): Params {
  const nodeEnv = config.get<string>('NODE_ENV', 'development');
  const isDev = nodeEnv === 'development';

  return {
    pinoHttp: {
      level: config.get<string>('LOG_LEVEL') ?? defaultLevel(nodeEnv),
      transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              translateTime: 'SYS:HH:MM:ss.l',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          '*.password',
          '*.passwordHash',
        ],
        censor: '[REDACTED]',
      },
      autoLogging: {
        ignore: (req) =>
          IGNORED_PATH_PREFIXES.some((prefix) => req.url?.startsWith(prefix)),
      },
      customLogLevel: (_req, res: ServerResponse, err) => {
        if (err || res.statusCode >= 500) {
          return 'error';
        }
        if (res.statusCode >= 400) {
          return 'warn';
        }
        return 'info';
      },
      customProps: (req) => {
        const userId = (req as RequestWithUser).user?.id;
        return userId ? { userId } : {};
      },
      serializers: {
        req: (req: RequestWithUser & { method?: string; url?: string }) => ({
          id: req.id,
          method: req.method,
          url: req.url,
        }),
        res: (res: ServerResponse) => ({ statusCode: res.statusCode }),
        err: (err: Error & { status?: number }) =>
          err.status !== undefined && err.status < 500
            ? { type: err.name, message: err.message }
            : stdSerializers.err(err),
      },
    },
  };
}
