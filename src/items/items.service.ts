import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

import { Item } from './entities/item.entity';
import { User } from '../users/entities/user.entity';

/**
 * The `ItemsService` is a NestJS service responsible for handling CRUD operations for items.
 * It provides methods to create, read, update, and delete items, along with additional functionalities.
 *
 * The service uses the `itemsRepository` from TypeORM, which is injected through the constructor.
 * This allows the service to interact with the database to perform the necessary operations.
 */
@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  /**
   * The function creates a new item using the provided input and user information, and saves it to the
   * items repository.
   * @param {CreateItemInput} createItemInput - An object containing the input data for creating a new item.
   * @param {User} user - The `user` parameter is an object representing the user who is creating the
   * item. It likely contains information such as the user's ID, name, email, etc.
   * @returns a Promise that resolves to an Item object.
   */
  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({ ...createItemInput, user });

    return await this.itemsRepository.save(newItem);
  }

  /**
   * Retrieves a paginated array of items belonging to a specific user. It supports pagination using the `PaginationArgs` object
   * and can filter items based on the `SearchArgs` object.
   *
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
   * @example
   * // Example usage:
   * const user = ...; // Get the user object
   * const paginationArgs = new PaginationArgs();
   * paginationArgs.limit = 10;
   * paginationArgs.offset = 0;
   * const searchArgs = new SearchArgs();
   * searchArgs.search = 'keyword';
   * const items = await this.itemsService.findAll(user, paginationArgs, searchArgs);
   */
  async findAll(
    user: User,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<Item[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    // Create a query builder for the `itemsRepository` with pagination and filtering options
    const queryBuilder = this.itemsRepository
      .createQueryBuilder('item')
      .where('item.userId = :userId', { userId: user.id })
      .take(limit)
      .skip(offset);

    // Add a condition to the query builder to filter the items based on the `name` column
    if (search) {
      queryBuilder.andWhere('LOWER(item.name) LIKE :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }

    return queryBuilder.getMany();
  }

  /**
   * The function `findOne` retrieves an item from the items repository based on its ID and the user's
   * ID, and throws an exception if the item is not found.
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of the
   * item you want to find.
   * @param {User} user - The `user` parameter is an object of type `User` that represents the user who
   * is requesting the item.
   * @returns a Promise that resolves to an Item object.
   */
  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({
      id,
      user: {
        id: user.id,
      },
    });

    if (!item) throw new NotFoundException(`Item with id: ${id} not found`);

    return item;
  }

  /**
   * Updates an item with the given ID and input, belonging to the specified user, and returns the updated item.
   *
   * @param {string} id - The unique identifier of the item to be updated.
   * @param {UpdateItemInput} updateItemInput - An object containing the updated information for the item.
   * @param {User} user - The user performing the update operation.
   *
   * @throws {NotFoundException} If the item doesn't exist or belongs to another user.
   *
   * @returns {Promise<Item>} The updated item.
   */
  async update(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    // If the item doesn't exist or belongs to another user, an exception will be thrown, and the method will terminate.
    await this.findOne(id, user);
    const item = await this.itemsRepository.preload(updateItemInput);

    if (!item) throw new NotFoundException(`Item with id: ${id} not found`);

    return this.itemsRepository.save(item);
  }

  /**
   * The `remove` function removes an item from the items repository and returns the removed item with
   * its ID.
   * @param {string} id - A string representing the ID of the item to be removed.
   * @param {User} user - The `user` parameter is an object of type `User`. It represents the user who
   * is performing the remove operation.
   * @returns an object that includes the properties of the `item` object and an additional `id`
   * property.
   */
  async remove(id: string, user: User): Promise<Item> {
    const item = await this.findOne(id, user);

    await this.itemsRepository.remove(item);

    return { ...item, id };
  }

  /**
   * The `itemCountByUser` function returns the number of items associated with a given user.
   * @param {User} user - The `user` parameter is an object of type `User`. It represents a user entity
   * and contains properties such as `id`, `name`, `email`, etc. In this particular function, the `id`
   * property of the `user` object is used to filter the items in the repository and
   * @returns The `itemCountByUser` function is returning a promise that resolves to a number.
   */
  async itemCountByUser(user: User): Promise<number> {
    return this.itemsRepository.count({
      where: {
        user: {
          id: user.id,
        },
      },
    });
  }
}
