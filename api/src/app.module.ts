import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { buildLoggerOptions } from './config/logger.config';
import { buildThrottlerOptions } from './config/throttler.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { validateEnv } from './config/env.validation';
import { buildDataSourceOptions } from './database/data-source';
import { UsersModule } from './modules/users/users.module';
import { WordsModule } from './modules/words/words.module';
import { TopicsModule } from './modules/topics/topics.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LessonsModule } from './modules/lessons/lessons.module';
import { DictionaryModule } from './modules/dictionary/dictionary.module';
import { WordAnswersModule } from './modules/word-answers/word-answers.module';
import { ExerciseTypesModule } from './modules/exercise-types/exercise-types.module';
import { ImagesModule } from './modules/images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildLoggerOptions,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildThrottlerOptions,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...buildDataSourceOptions(),
        autoLoadEntities: true,
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'static'),
      serveRoot: '/static',
    }),
    UsersModule,
    AuthModule,
    WordsModule,
    TopicsModule,
    LessonsModule,
    DictionaryModule,
    WordAnswersModule,
    ExerciseTypesModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Order matters: rate limiting, then authentication, then authorization.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
