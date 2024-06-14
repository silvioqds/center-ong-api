import {
    Injectable,
    NotAcceptableException,
    UnauthorizedException,
  } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Authentication } from 'src/entity/view/auth/auth';
import { User } from 'src/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { CryptoService } from './crypto.service';
import { MailService } from 'src/mailer/mail.service';

  @Injectable()
  export class AuthService {
    constructor(
      private readonly usersService: UserService,
      private jwtService: JwtService,
      private readonly cryptoService: CryptoService,      
      private readonly mailService: MailService
    ) {}

    private readonly passwordResetTokens: Map<string, string> = new Map();

    async validateUser(auth : Authentication): Promise<any> {
      const user = await this.usersService.findByEmail(auth.email);

      if (!user)
        throw new UnauthorizedException('Usuário inexistente');       

      const pass = user.password;
      const isPasswordValid = await this.cryptoService.comparePasswords(auth.password, pass);

      if (isPasswordValid)
        return await this.gerarToken(user);
      
      throw new UnauthorizedException('Usuário ou Senha Inválidos');
    }
  
    async gerarToken(payload: User) {
      delete payload.password;
      return {       
        user: payload,
        access_token: this.jwtService.sign(
          { email: payload.email },
          {
            secret: 'topSecret512',
            expiresIn: '7d',
          },
        ),
      };
    }


    async sendPasswordResetEmail(email: string): Promise<void> {

      const user = await this.usersService.findByEmail(email);
  
      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }
  
      const token = await this.createToken(email)      
  
      const resetLink = `http://localhost:5173/reset-password?token=${token}`;
      this.mailService.sendResetPasswordEmail(email, resetLink);
    }


    async resetPassword(token: string, newPassword: string): Promise<void> {
   
      const userEmail = await this.getUserEmailByToken(token);
  
      if (!userEmail) {
        throw new UnauthorizedException('Token inválido ou expirado');
      }
     
      await this.usersService.updateUserPassword(userEmail, newPassword);
      
      this.removeToken(token);
    }
    

    async createToken(email: string): Promise<string> {      
      const randomNumber = Math.floor(Math.random() * 1000000);
      await this.passwordResetTokens.set(randomNumber.toString(), email);
      return await randomNumber.toString();
    }
  
    async getUserEmailByToken(token: string): Promise<string | null> {
      const userEmail = await this.passwordResetTokens.get(token);
      return userEmail || null;
    }
  
    async removeToken(token: string): Promise<void> {
      await this.passwordResetTokens.delete(token);
    }

  }
  