import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateItemInput } from './dto/inputs/create-item.input';
import { UpdateItemInput } from './dto/inputs/update-item.input';
import { Item } from './entities/item.entity';
import { User } from 'src/users/entities/user.entity';

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
   * The `findAll` function returns a promise that resolves to an array of items belonging to a
   * specific user.
   * @param {User} user - The `user` parameter is an object of type `User`. It represents the user for
   * whom we want to find all items. The `User` object has a property `id` which is used to filter the
   * items.
   * @returns The `findAll` function is returning a promise that resolves to an array of `Item`
   * objects.
   * @author Cuervolu
   */
  async findAll(user: User): Promise<Item[]> {
    return this.itemsRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
    });
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
