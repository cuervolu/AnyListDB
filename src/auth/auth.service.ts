import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpInput, LoginInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * The function `getJwtToken` generates a JSON Web Token (JWT) for a given user ID.
   * @param {string} userId - The `userId` parameter is a string that represents the unique identifier
   * of a user.
   * @returns a JSON Web Token (JWT) that is signed with the user's ID.
   */
  private getJwtToken(userId: string) {
    return this.jwtService.sign({ id: userId });
  }

  /**
   * The `signup` function creates a new user, generates a JWT token for authentication, and returns
   * the token along with the user object.
   * @param {SignUpInput} signupInput - The `signupInput` parameter is an object that contains the
   * necessary information for signing up a user. It includes properties such as `email`,
   * `password`, `username`, and any other required fields for creating a new user account.
   * @returns a Promise that resolves to an object of type AuthResponse. The AuthResponse object
   * contains a token and a user.
   */
  async signup(signupInput: SignUpInput): Promise<AuthResponse> {
    const user = await this.userService.create(signupInput);

    const token = this.getJwtToken(user.id);

    return {
      token,
      user,
    };
  }

  /**
   * The login function takes in a login input, checks if the email and password match a user's
   * credentials, and returns a token and user object if successful.
   * @param {LoginInput} loginInput - The `loginInput` parameter is an object that contains the user's
   * email and password.
   * @returns The login function is returning a Promise that resolves to an AuthResponse object. The
   * AuthResponse object contains a token and a user.
   */
  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginInput;
    const user = await this.userService.findOneByEmail(email);

    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException('Email / Password do not match');
    }

    const token = this.getJwtToken(user.id);

    return {
      token,
      user,
    };
  }

  /**
   * The function validates a user by checking if they are active and throws an exception if they are
   * inactive.
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of a
   * user.
   * @returns The user object is being returned, after removing the password property.
   */
  async validateUser(id: string): Promise<User> {
    const user = await this.userService.findOneById(id);
    if (!user.isActive)
      throw new UnauthorizedException(`User is inactive, talk with an admin`);
    delete user.password;
    return user;
  }

  /**
   * The function revalidateToken takes a user object as input, generates a JWT token using the user's
   * ID, and returns an authentication response object containing the token and the user.
   * @param {User} user - The user object represents the user for whom the token needs to be
   * revalidated. It typically contains information such as the user's ID, username, email, and other
   * relevant details.
   * @returns an object of type AuthResponse. The object has two properties: "token" which is a string
   * representing a JWT token, and "user" which is an object of type User.
   */
  revalidateToken(user: User): AuthResponse {
    const token = this.getJwtToken(user.id);

    return {
      token,
      user,
    };
  }
}
