import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { FileModule } from './file/file.module';
import { MemberModule } from './member/member.module';
import { SessionModule } from './session/session.module';
import { EventModule } from './event/event.module';
import { NotificationModule } from './notification/notification.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DbModule,
    AuthModule,
    UserModule,
    GroupModule,
    FileModule,
    MemberModule,
    SessionModule,
    EventModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        'auth/login',
        'auth/register',
        'auth/check-email',
        'auth/logout',
        'file/upload',
      )
      .forRoutes('*');
  }
}
