import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';

import { ListsService } from './lists.service';

import { List } from './entities/list.entity';
import { User } from 'src/users/entities/user.entity';

import { CreateListInput, UpdateListInput } from './dto/inputs';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { ListItemService } from 'src/list-item/list-item.service';

/**
 * Resolver for the `List` entity.
 *
 * This resolver provides query and mutation methods to interact with the `List` entity in the GraphQL API.
 * It handles CRUD operations for the `List` entity, including creating, reading, updating, and deleting lists.
 *
 * @since 1.5.0
 * @see List
 * @see CreateListInput
 * @see UpdateListInput
 * @see PaginationArgs
 * @see SearchArgs
 * @author Cuervolu
 */
@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListsResolver {
  constructor(
    private readonly listsService: ListsService,
    private readonly listItemsService: ListItemService,
  ) {}

  /**
   * Mutation resolver to create a new list.
   * @param {CreateListInput} createListInput - The input object containing the data for creating the list.
   * @param {User} user - The current authenticated user.
   * @returns {Promise<List>} A promise that resolves to the created list.
   */
  @Mutation(() => List)
  async createList(
    @Args('createListInput') createListInput: CreateListInput,
    @CurrentUser() user: User,
  ): Promise<List> {
    return this.listsService.create(createListInput, user);
  }

  /**
   * Query resolver to get a list of lists.
   * @param {User} user - The current authenticated user.
   * @param {PaginationArgs} paginationArgs - The pagination arguments for the query.
   * @param {SearchArgs} searchArgs - The search arguments for filtering the lists.
   * @returns {Promise<List[]>} A promise that resolves to an array of lists.
   */
  @Query(() => [List], { name: 'lists' })
  async findAll(
    @CurrentUser() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<List[]> {
    return this.listsService.findAll(user, paginationArgs, searchArgs);
  }

  /**
   * Query resolver to get a single list by its ID.
   * @param {string} id - The ID of the list.
   * @param {User} user - The current authenticated user.
   * @returns {Promise<List>} A promise that resolves to the found list.
   */
  @Query(() => List, { name: 'list' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<List> {
    return this.listsService.findOne(id, user);
  }

  /**
   * Mutation resolver to update a list.
   * @param {UpdateListInput} updateListInput - The input object containing the data for updating the list.
   * @param {User} user - The current authenticated user.
   * @returns {Promise<List>} A promise that resolves to the updated list.
   */
  @Mutation(() => List)
  async updateList(
    @Args('updateListInput') updateListInput: UpdateListInput,
    @CurrentUser() user: User,
  ): Promise<List> {
    return this.listsService.update(updateListInput.id, updateListInput, user);
  }

  /**
   * Mutation resolver to remove a list.
   * @param {string} id - The ID of the list to be removed.
   * @param {User} user - The current authenticated user.
   * @returns {Promise<List>} A promise that resolves to the removed list.
   */
  @Mutation(() => List)
  removeList(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<List> {
    return this.listsService.remove(id, user);
  }

  @ResolveField(() => [ListItem], { name: 'items' })
  async getListItems(
    @Parent() list: List,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    return this.listItemsService.findAll(list, paginationArgs, searchArgs);
  }

  @ResolveField(() => Number, { name: 'totalItems' })
  async countListItemByList(@Parent() list: List): Promise<number> {
    return this.listItemsService.countListItemByList(list);
  }
}
