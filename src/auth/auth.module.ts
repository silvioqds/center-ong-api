import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { Category } from 'src/entity/category.entity';
import { User } from 'src/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtStrategy } from './local-auth';
import { AuthController } from './auth.controller';
import { CryptoService } from './crypto.service';
import { MailService } from 'src/mailer/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Category]), 
    JwtModule.register({}),
    PassportModule,
    JwtModule
  ],
  providers: [AuthService, UserService, JwtStrategy, CryptoService, MailService],
  controllers: [AuthController]
})
export class AuthModule {}
