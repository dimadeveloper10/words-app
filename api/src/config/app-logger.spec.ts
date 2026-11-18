import { PinoLogger } from 'nestjs-pino';
import { AppLogger } from './app-logger';

describe('AppLogger', () => {
  let pino: { trace: jest.Mock; info: jest.Mock; warn: jest.Mock };
  let logger: AppLogger;

  beforeEach(() => {
    pino = { trace: jest.fn(), info: jest.fn(), warn: jest.fn() };
    logger = new AppLogger(pino as unknown as PinoLogger, {});
  });

  it.each([
    'NestFactory',
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
  ])('sends %s startup logs to trace', (context) => {
    logger.log('startup detail', context);

    expect(pino.trace).toHaveBeenCalledWith({ context }, 'startup detail');
    expect(pino.info).not.toHaveBeenCalled();
  });

  it.each([
    ['the application start message', ['NestApplication']],
    ['application contexts', ['WordsService']],
    ['logs without a context', []],
  ])('keeps %s at info', (_label, params) => {
    logger.log('message', ...params);

    expect(pino.info).toHaveBeenCalled();
    expect(pino.trace).not.toHaveBeenCalled();
  });

  it('does not change warnings from framework contexts', () => {
    logger.warn('careful', 'InstanceLoader');

    expect(pino.warn).toHaveBeenCalledWith(
      { context: 'InstanceLoader' },
      'careful',
    );
  });
});
