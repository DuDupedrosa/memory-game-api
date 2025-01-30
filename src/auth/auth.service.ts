import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: { username: string; userId: string; email: string }) {
    const payload = {
      username: user.username,
      sub: user.userId,
      email: user.email,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
