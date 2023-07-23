import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { SignUpInput } from 'src/auth/dto/inputs/signup.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  private logger: Logger = new Logger('UsersService');

  constructor(
    /* `@InjectRepository(User)` is a decorator provided by the `@nestjs/typeorm` package. It is used
    to inject the `User` repository into the `UsersService` class. */
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * The create function takes a SignUpInput object, creates a new user with the hashed password, and
   * saves it to the database.
   * @param {SignUpInput} signUpInput - The `signUpInput` parameter is an object that contains the
   * input data for creating a new user. It likely includes properties such as `username`, `email`, and
   * `password`.
   * @returns a Promise that resolves to a User object.
   */
  async create(signUpInput: SignUpInput): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        ...signUpInput,
        password: bcrypt.hashSync(signUpInput.password, 10),
      });

      return await this.usersRepository.save(newUser);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  /**
   * The function findOneById takes an id as input and returns a Promise that resolves to a User
   * object, or throws a NotFoundException if the user with the given id is not found.
   * @param {string} id - A string representing the unique identifier of the user to be found.
   * @returns The `findOneById` function is returning a `Promise` that resolves to a `User` object.
   */
  async findOneById(id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException(`${id} not found`);
    }
  }

  async findAll(): Promise<User[]> {
    return [];
  }

  /**
   * The function findOneByEmail takes an email as input and returns a Promise that resolves to a User
   * object, or throws a NotFoundException if the user with the given email is not found.
   * @param {string} email - The email parameter is a string that represents the email address of the
   * user you are trying to find.
   * @returns The `findOneByEmail` function is returning a `Promise` that resolves to a `User` object.
   */
  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ email });
    } catch (error) {
      throw new NotFoundException(`${email} not found`);
    }
  }

  block(id: string): Promise<User> {
    throw new Error(`block method not implemented`);
  }

  /**
   * The function handles database errors by logging the error, checking the error code, and throwing
   * appropriate exceptions.
   * @param {any} error - The `error` parameter is of type `any`, which means it can be any type of
   * error object.
   */
  private handleDBErrors(error: any): never {
    this.logger.error(error);
    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key', ''));
    }
    throw new InternalServerErrorException('Please check server logs');
  }
}
