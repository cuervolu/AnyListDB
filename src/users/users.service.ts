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
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

import { User } from './entities/user.entity';
import { SignUpInput } from 'src/auth/dto/inputs/signup.input';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto/inputs/update-user.input';

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
   * Retrieves users from the database based on their roles using a query builder.
   *
   * @param {ValidRoles[]} roles - An array of valid roles used to filter the users.
   * @param {PaginationArgs} paginationArgs - An object of type `PaginationArgs` containing the `limit` and `offset`properties to support pagination. The `limit` specifies the maximum number of users to return, while the `offset` specifies the starting position of the data to be queried.
   * @param {SearchArgs} searchArgs - An object of type `SearchArgs` containing the `search` property for filtering users based on a search term. The `search` parameter allows filtering users by their full name using a case-insensitive search.
   * @returns {Promise<User[]>} A promise that resolves to an array of `User` objects matching the specified criteria.
   * @since 1.4.0
   * @see ValidRoles
   * @see PaginationArgs
   * @see SearchArgs
   */
  async findAll(
    roles: ValidRoles[],
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<User[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.usersRepository
      .createQueryBuilder()
      .limit(limit)
      .offset(offset);

    /* 
    The code is creating a query builder to retrieve users from the database based on
    their roles. The roles are checked against an array column using the overlap operator (&&).
    For PostgreSQL, the 'ARRAY[roles] && ARRAY[:...roles]' syntax checks if any element in
    the 'roles' array overlaps with the elements in the ':...roles' parameter array.
    @see Array Functions and Operators from PostgreSQL Documentation:
    {@link https://www.postgresql.org/docs/current/functions-array.html#ARRAY-OPERATORS-TABLE}
    */
    if (roles.length !== 0) {
      queryBuilder
        .andWhere('ARRAY[roles] && ARRAY[:...roles]')
        .setParameter('roles', roles);
    }

    if (search) {
      console.log(search);
      queryBuilder.andWhere('LOWER("fullName") LIKE :fullName', {
        fullName: `%${search.toLowerCase()}%`,
      });
    }

    return await queryBuilder.getMany();
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
