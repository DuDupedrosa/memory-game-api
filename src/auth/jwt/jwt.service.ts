import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'), // Acessando a variável de ambiente corretamente,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any): Promise<any> {
    const user = {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
    };

    // Atribui o tipo RequestWithUser no request.user
    req.user = user; // Aqui você garante que req.user tem as propriedades corretamente

    return user;
  }
}
