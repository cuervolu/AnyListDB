import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  /**
   * The function validates a JWT payload by calling the `validateUser` method of the `authService` and
   * returns the corresponding user.
   * @param {JwtPayload} payload - The `payload` parameter is an object that represents the JSON Web
   * Token (JWT) payload. It typically contains information about the user, such as their ID, username,
   * and any additional claims or data.
   * @returns a Promise that resolves to a User object.
   */
  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;

    const user = await this.authService.validateUser(id);

    return user;
  }
}
