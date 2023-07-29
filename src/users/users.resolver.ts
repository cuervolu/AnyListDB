/* eslint-disable @typescript-eslint/no-unused-vars */
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Int,
  Parent,
} from '@nestjs/graphql';

import { UsersService } from './users.service';
import { ItemsService } from 'src/items/items.service';

import { User } from './entities/user.entity';
import { Item } from 'src/items/entities/item.entity';

import { ValidRolesArgs } from './dto/args/roles.arg';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

import { UpdateUserInput } from './dto/inputs';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

/**
 * The `UsersResolver` is a NestJS resolver responsible for handling GraphQL queries and mutations related to users.
 * It provides methods to retrieve, update, and block user data, as well as resolve additional fields such as the item count.
 *
 * The resolver is decorated with the `@Resolver(() => User)` decorator, indicating that it is resolving operations related to the `User` type.
 * Additionally, the `@UseGuards(JwtAuthGuard)` decorator is used to ensure that authentication is required for all methods within this resolver.
 */
@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemService: ItemsService,
  ) {}

  @Query(() => [User], { name: 'users' })
  /**
   * The function `findAll` takes in a list of valid roles and the current user, and returns a promise
   * that resolves to an array of users.
   * @param {ValidRolesArgs} validRoles - The validRoles parameter is an argument decorator that is
   * used to specify the valid roles that can be passed to the findAll method. It is of type
   * ValidRolesArgs.
   * @param {User} user - The "user" parameter is of type "User" and is annotated with the
   * "@CurrentUser([ValidRoles.admin])" decorator. This decorator indicates that the current user must
   * have the "admin" role in order to access this method.
   * @returns a Promise that resolves to an array of User objects.
   */
  findAll(
    @Args() validRoles: ValidRolesArgs,
    @CurrentUser([ValidRoles.admin, ValidRoles.superUser]) _user: User,
  ): Promise<User[]> {
    return this.usersService.findAll(validRoles.roles);
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin, ValidRoles.superUser]) _user: User,
  ): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name: 'updateUser' })
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ValidRoles.admin]) _user: User,
  ): Promise<User> {
    return this.usersService.update(updateUserInput.id, updateUserInput, _user);
  }

  @Mutation(() => User, { name: 'blockUser' })
  blockUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin]) _user: User,
  ): Promise<User> {
    return this.usersService.block(id, _user);
  }

  @ResolveField(() => Int, { name: 'itemCount' })
  /**
   * The `itemCount` function returns the number of items associated with a user, but only if the
   * current user is an admin.
   * @param {User} adminUser - The adminUser parameter is of type User and is decorated with the
   * @CurrentUser decorator. It is expected to be an admin user.
   * @param {User} user - The `user` parameter is of type `User` and represents the user for whom we
   * want to retrieve the item count.
   * @returns The `itemCount` function is returning a Promise that resolves to a number.
   */
  async itemCount(
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User,
  ): Promise<number> {
    return this.itemService.itemCountByUser(user);
  }
  /**
   * Resolves the 'items' field for a user, retrieving a paginated array of items belonging to the user.
   * It supports pagination using the `PaginationArgs` object and can filter items based on the `SearchArgs` object.
   *
   * @param {User} adminUser - An object of type `User` representing the admin user who is requesting the items. Only admin users are allowed to access this field.
   * @param {User} user - An object of type `User` representing the user for whom we want to find all items.
   * The `User` object has a property `id` which is used to filter the items.
   * @param {PaginationArgs} paginationArgs - An object of type `PaginationArgs` containing the `limit` and `offset` properties to support pagination.
   * The `limit` specifies the maximum number of items to return, while the `offset` specifies the starting position of the data to be queried.
   * @param {SearchArgs} searchArgs - An object of type `SearchArgs` containing the `search` property for filtering items based on a search term.
   * The `search` parameter allows filtering items by the `name` column using a case-insensitive search.
   * @returns {Promise<Item[]>} A promise that resolves to an array of `Item` objects matching the specified criteria.
   * @since 1.2.0
   * @see PaginationArgs
   * @see SearchArgs
   */
  @ResolveField(() => [Item], { name: 'items' })
  async getItemsByUser(
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<Item[]> {
    return this.itemService.findAll(user, paginationArgs, searchArgs);
  }
}
