import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { LoginInput, SignUpInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response.type';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ValidRoles } from './enums/valid-roles.enum';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, { name: 'signup' })
  /**
   * The `signup` function takes a `signupInput` argument and returns a promise that resolves to an
   * `AuthResponse` object.
   * @param {SignUpInput} signupInput - The `signupInput` parameter is of type `SignUpInput`. It is an
   * object that contains the necessary information for a user to sign up, such as their email,
   * password, and any other required fields.
   * @returns a Promise that resolves to an AuthResponse.
   */
  async signup(
    @Args('signupInput') signupInput: SignUpInput,
  ): Promise<AuthResponse> {
    return this.authService.signup(signupInput);
  }

  @Mutation(() => AuthResponse, { name: 'login' })
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Query(() => AuthResponse, { name: 'revalidate' })
  @UseGuards(JwtAuthGuard)
  /**
   * The function revalidates a token for a user with the admin role and returns an authentication
   * response.
   * @param {User} user - The `user` parameter is of type `User` and is annotated with
   * `@CurrentUser([ValidRoles.admin])`. This annotation indicates that the `user` object should be
   * retrieved from the current session and that the user must have the role `admin` in order to access
   * this method.
   * @returns an object of type AuthResponse.
   */
  revalidateToken(@CurrentUser([ValidRoles.admin]) user: User): AuthResponse {
    return this.authService.revalidateToken(user);
  }
}
