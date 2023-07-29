import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';

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
   * @param {UsersService} userService - The UsersService instance.
   * @param {ItemsService} itemService - The ItemsService instance.
   */
  constructor(
    configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly userService: UsersService,
    private readonly itemService: ItemsService,
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
}
