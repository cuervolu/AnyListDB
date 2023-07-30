import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Item } from 'src/items/entities/item.entity';
import { ItemsService } from 'src/items/items.service';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { User } from 'src/users/entities/user.entity';

import { ListItemService } from 'src/list-item/list-item.service';
import { ListsService } from 'src/lists/lists.service';
import { SEED_ITEMS, SEED_LIST, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';

/**
 * @description Service for seeding data in the database.
 * @since 1.0.0
 * @author cuervolu
 */
@Injectable()
export class SeedService {
  //This property is used to store whether the application is running in a production environment or not.
  private isProd: boolean;

  /**
   * @constructor
   * @param {ConfigService} configService - The ConfigService instance.
   * @param {Repository<Item>} itemsRepository - The repository for Item entities.
   * @param {Repository<User>} usersRepository - The repository for User entities.
   * @param {Repository<List>} listsRepository - The repository for ListItems entities.
   * @param {Repository<ListItem>} listItemRepository - The repository for Lists entities.
   * @param {UsersService} userService - The UsersService instance.
   * @param {ItemsService} itemService - The ItemsService instance.
   * @param {ListItemService} listItemService - The ListItemService instance.
   * @param {ListsService} listService - The ListService instance.
   */
  constructor(
    configService: ConfigService,

    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,

    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,

    private readonly userService: UsersService,
    private readonly itemService: ItemsService,
    private readonly listItemService: ListItemService,
    private readonly listService: ListsService,
  ) {
    this.isProd = configService.get('STATE') === 'prod';
  }

  /**
   * The `executeSeed` function is responsible for cleaning up the database, creating users, and loading
   * items for testing and development purposes.
   * This function should NOT be used in a production environment.
   *
   * @throws {UnauthorizedException} If the function is executed in a production environment.
   *
   * @returns {Promise<boolean>} A promise that resolves to a boolean value of `true` after the seeding process is complete.
   */
  async executeSeed(): Promise<boolean> {
    if (this.isProd) {
      throw new UnauthorizedException(
        'The "executeSeed" function cannot be run in a production environment.',
      );
    }
    try {
      // Clean up the database
      //! WARNING: The `deleteDatabase` function deletes all items and users from the database.
      //! Use this function with caution as it will permanently remove all data from the database.
      //! This operation cannot be undone.
      await this.deleteDatabase();

      // Create users
      const user = await this.loadUsers();

      // Create items
      await this.loadItems(user);

      // Create lists
      const list = await this.loadLists(user);

      //Create listItems
      const items = await this.itemService.findAll(
        user,
        { limit: 15, offset: 0 },
        {},
      );
      await this.loadListItems(list, items);

      return true;
    } catch (error) {
      console.error('An error occurred during seeding:', error);
      return false;
    }
  }

  /**
   *@Warning The`deleteDatabase` function deletes all items and users from the database.
   * Use this function with caution as it will permanently remove all data from the database.
   * This operation cannot be undone.
   */
  async deleteDatabase() {
    //Delete listItems
    await this.listItemRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    //Delete  List
    await this.listsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    //Delete items
    await this.itemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    //Delete Users
    await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }

  /**
   * The function "loadUsers" asynchronously loads a list of users from a seed data array and returns the first user.
   * @returns the first user object from the `users` array.
   */
  async loadUsers(): Promise<User> {
    const users = [];

    for (const user of SEED_USERS) {
      users.push(await this.userService.create(user));
    }

    return users[0];
  }

  /**
   * The function "loadItems" asynchronously creates items for a user using a list of seed items.
   * @param {User} user - The `user` parameter is an object representing a user.
   */
  async loadItems(user: User): Promise<void> {
    const itemsPromises = [];

    for (const item of SEED_ITEMS) {
      itemsPromises.push(await this.itemService.create(item, user));
    }

    await Promise.all(itemsPromises);
  }

  /**
   * The function "loadLists" asynchronously loads lists for a user by creating them using the list
   * service.
   * @param {User} user - The "user" parameter is an object representing the user for whom the lists
   * are being loaded.
   * @returns The first element of the "lists" array is being returned.
   */
  async loadLists(user: User): Promise<List> {
    const lists = [];

    for (const list of SEED_LIST) {
      lists.push(await this.listService.create(list, user));
    }

    return lists[0];
  }

  /**
   * The function `loadListItems` asynchronously creates list items with random quantities and
   * completion statuses for a given list and array of items.
   * @param {List} list - The "list" parameter is an object representing a list.
   * @param {Item[]} items - The `items` parameter is an array of `Item` objects. Each `Item` object
   * represents an item that needs to be added to a list.
   */
  async loadListItems(list: List, items: Item[]) {
    for (const item of items) {
      this.listItemService.create({
        quantity: Math.round(Math.random() * 10),
        completed: Math.round(Math.random() * 1) === 0 ? false : true,
        listId: list.id,
        itemId: item.id,
      });
    }
  }
}
