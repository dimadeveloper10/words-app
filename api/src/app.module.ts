import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Order matters: authentication runs before authorization.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
