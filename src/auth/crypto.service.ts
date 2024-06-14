import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');

    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          const hashedPassword = derivedKey.toString('hex');
          resolve(`${hashedPassword}:${salt}`);
        }
      });
    });
  }

  async comparePasswords(password: string, storedPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [hashedPassword, salt] = storedPassword.split(':');      
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          const newHashedPassword = derivedKey.toString('hex');         
          resolve(newHashedPassword === hashedPassword);
        }
      });
    });
  }
}
