import { ConfigService } from '@nestjs/config';
import type { Options } from 'pino-http';
import { buildLoggerOptions } from './logger.config';

function pinoOptions(env: Record<string, string>): Options {
  const config = new ConfigService(env);
  return buildLoggerOptions(config).pinoHttp as Options;
}

describe('buildLoggerOptions', () => {
  it.each([
    [{ NODE_ENV: 'development' }, 'debug'],
    [{ NODE_ENV: 'production' }, 'info'],
    [{ NODE_ENV: 'test' }, 'silent'],
    [{ NODE_ENV: 'production', LOG_LEVEL: 'warn' }, 'warn'],
  ])('uses the right level for %j', (env, level) => {
    expect(pinoOptions(env).level).toBe(level);
  });

  it('pretty-prints only in development', () => {
    expect(pinoOptions({ NODE_ENV: 'development' }).transport).toEqual(
      expect.objectContaining({ target: 'pino-pretty' }),
    );
    expect(pinoOptions({ NODE_ENV: 'production' }).transport).toBeUndefined();
  });

  it('redacts credentials', () => {
    expect(pinoOptions({}).redact).toEqual({
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        '*.password',
        '*.passwordHash',
      ],
      censor: '[REDACTED]',
    });
  });

  it('skips docs and static files in request logs', () => {
    const { autoLogging } = pinoOptions({}) as {
      autoLogging: { ignore: (req: { url?: string }) => boolean };
    };

    expect(autoLogging.ignore({ url: '/docs/swagger.json' })).toBe(true);
    expect(autoLogging.ignore({ url: '/static/a.webp' })).toBe(true);
    expect(autoLogging.ignore({ url: '/words' })).toBe(false);
  });

  it('maps status codes and errors to log levels', () => {
    const level = pinoOptions({}).customLogLevel as unknown as (
      req: unknown,
      res: { statusCode: number },
      err?: Error,
    ) => string;

    expect(level({}, { statusCode: 200 })).toBe('info');
    expect(level({}, { statusCode: 404 })).toBe('warn');
    expect(level({}, { statusCode: 503 })).toBe('error');
    expect(level({}, { statusCode: 200 }, new Error('x'))).toBe('error');
  });

  it('adds the user id only when authenticated', () => {
    const props = pinoOptions({}).customProps as unknown as (
      req: unknown,
    ) => object;

    expect(props({ user: { id: 'u1' } })).toEqual({ userId: 'u1' });
    expect(props({})).toEqual({});
  });

  it('keeps request, response and error logs compact', () => {
    const serializers = pinoOptions({}).serializers as Record<
      string,
      (value: unknown) => unknown
    >;

    expect(
      serializers.req({ id: 1, method: 'GET', url: '/words', headers: {} }),
    ).toEqual({ id: 1, method: 'GET', url: '/words' });
    expect(
      serializers.res({
        statusCode: 201,
        headers: {},
      }),
    ).toEqual({ statusCode: 201 });
    expect(
      serializers.err(
        Object.assign(new Error('Word not found'), {
          name: 'NotFoundException',
          status: 404,
        }),
      ),
    ).toEqual({ type: 'NotFoundException', message: 'Word not found' });
    expect(serializers.err(new Error('boom'))).toMatchObject({
      type: 'Error',
      message: 'boom',
    });
    expect(serializers.err(new Error('boom'))).toHaveProperty('stack');
  });
});
