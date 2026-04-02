import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  async hash(password: string): Promise<string> { 
    return bcrypt.hash(password, 10); 
  }

  async compare(password: string, hash: string): Promise<boolean> { 
    return bcrypt.compare(password, hash); 
  }

  token(user: { id: number; email: string }) { 
    return this.jwt.sign({ id: user.id, email: user.email }); 
  }
}
