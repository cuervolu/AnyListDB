import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { SignUpInput } from 'src/auth/dto/inputs/signup.input';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto/update-user.input';

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
   * The `update` function updates a user's information in the database and returns the updated user.
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of the
   * user that needs to be updated. It is used to locate the user in the database.
   * @param {UpdateUserInput} updateUserInput - The `updateUserInput` parameter is an object that
   * contains the updated information for the user. It could include properties such as `name`, `email`,
   * `password`, etc. This object is used to update the corresponding user in the database.
   * @param {User} updatedBy - The `updatedBy` parameter is of type `User` and represents the user who is
   * performing the update operation. It is used to track the user who last updated the user record.
   * @returns a Promise that resolves to a User object.
   */
  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    updatedBy: User,
  ): Promise<User> {
    try {
      const user = await this.usersRepository.preload({
        ...updateUserInput,
        id,
      });
      if (!user) throw new NotFoundException(`Item with id: ${id} not found`);

      user.lastUpdatedBy = updatedBy;

      return await this.usersRepository.save(user);
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
  /**
   * The `findAll` function retrieves users from the database based on their roles using a query
   * builder.
   * @param {ValidRoles[]} roles - An array of valid roles that are used to filter the users.
   * @returns The function `findAll` returns a Promise that resolves to an array of User objects.
   */
  async findAll(roles: ValidRoles[]): Promise<User[]> {
    if (roles.length === 0)
      return this.usersRepository.find({
        //? It's not necessary because lastUpdatedBy is set to lazy
        //   relations: {
        //     lastUpdatedBy: true,
        //   },
      });

    /* 
    The code is creating a query builder to retrieve users from the database based on
    their roles.
     @see Array Functions and Operators from PostgreSQL 9.6.24 Documentation {@link https://www.postgresql.org/docs/9.6/functions-array.html} 
    */
    return this.usersRepository
      .createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
      .getMany();
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

  /**
   * The `block` function blocks a user by setting their `isActive` property to false and updating the
   * `lastUpdatedBy` property with the admin user.
   * @param {string} id - A string representing the ID of the user to be blocked.
   * @param {User} adminUser - The `adminUser` parameter is an object of type `User` that represents the
   * admin user who is performing the block action.
   * @returns a Promise that resolves to a User object.
   */
  async block(id: string, adminUser: User): Promise<User> {
    const userToBlock = await this.findOneById(id);

    userToBlock.isActive = false;
    userToBlock.lastUpdatedBy = adminUser;

    return await this.usersRepository.save(userToBlock);
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
