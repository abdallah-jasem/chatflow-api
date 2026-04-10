import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/messages.module';
import { FilesModule } from './files/files.module';
import { ChatModule } from './chat/chat.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import jwtConfig from './auth/config/jwt.config';
import { SanitizeUserInterceptor } from './auth/interceptors/sanitize-user.interceptor';
import { Room } from './rooms/entities/room.entity';
import { RoomMember } from './rooms/entities/room-member.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // الـ Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        entities: [User, Room, RoomMember],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    AuthModule,
    UsersModule,
    RoomsModule,
    MessagesModule,
    FilesModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, SanitizeUserInterceptor],
})
export class AppModule {}
