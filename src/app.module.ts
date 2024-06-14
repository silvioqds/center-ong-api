// AppModule
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { DataSource } from 'typeorm';
import { CategoryModule } from './category/category.module';
import { User } from './entity/user.entity';
import { Category } from './entity/category.entity';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/local-auth';
import { JwtModule } from '@nestjs/jwt';
import { CryptoService } from './auth/crypto.service';
import { MailModule } from './mailer/mailer.module';
import { MailService } from './mailer/mail.service';
import { FeedModule } from './feed/feed.module';
import { CommentEntity } from './entity/comment.entity';
import { ShareModule } from './share/share.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([User,Category, CommentEntity]),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '172.19.0.1',
      port: 3707,
      username: 'root',
      password: 'MBAGrupo4',
      database: 'center',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true      
    }),
    UserModule,
    CategoryModule,
    AuthModule,    
    JwtModule.register({}),  
    FeedModule,
    MailModule,
    ShareModule
  ],
  providers: [UserService, AuthService, JwtStrategy, CryptoService, MailService]
})

export class AppModule {
  constructor(private dataSource: DataSource) {}
}
