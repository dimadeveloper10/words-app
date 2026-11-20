import { ConfigService } from '@nestjs/config';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Params } from 'nestjs-pino';
import { stdSerializers, type TransportSingleOptions } from 'pino';

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

const REDACT = {
  paths: [
    'req.headers.authorization',
    'req.headers.cookie',
    '*.password',
    '*.passwordHash',
  ],
  censor: '[REDACTED]',
};

const SERIALIZERS = {
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
};

function prettyTransport(isDev: boolean): TransportSingleOptions | undefined {
  if (!isDev) {
    return undefined;
  }
  return {
    target: 'pino-pretty',
    options: {
      singleLine: true,
      translateTime: 'SYS:HH:MM:ss.l',
      ignore: 'pid,hostname',
    },
  };
}

function logLevelFor(
  _req: IncomingMessage,
  res: ServerResponse,
  err?: Error,
): 'error' | 'warn' | 'info' {
  if (err || res.statusCode >= 500) {
    return 'error';
  }
  if (res.statusCode >= 400) {
    return 'warn';
  }
  return 'info';
}

export function buildLoggerOptions(config: ConfigService): Params {
  const nodeEnv = config.get<string>('NODE_ENV', 'development');

  return {
    pinoHttp: {
      level: config.get<string>('LOG_LEVEL') ?? defaultLevel(nodeEnv),
      transport: prettyTransport(nodeEnv === 'development'),
      redact: REDACT,
      autoLogging: {
        ignore: (req) =>
          IGNORED_PATH_PREFIXES.some((prefix) => req.url?.startsWith(prefix)),
      },
      customLogLevel: logLevelFor,
      customProps: (req) => {
        const userId = (req as RequestWithUser).user?.id;
        return userId ? { userId } : {};
      },
      serializers: SERIALIZERS,
    },
  };
}
