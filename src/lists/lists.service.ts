import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateListInput, UpdateListInput } from './dto/inputs';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

import { List } from './entities/list.entity';
import { User } from 'src/users/entities/user.entity';

/**
 * Service responsible for handling operations related to lists.
 *
 * @class ListsService
 * @since 1.5.0
 * @example
 * // Example usage:
 * const createListInput = new CreateListInput();
 * createListInput.name = 'My New List';
 * const user = ...; // Get the user object
 * const newList = await this.listsService.create(createListInput, user);
 *
 * const paginationArgs = new PaginationArgs();
 * paginationArgs.limit = 10;
 * paginationArgs.offset = 0;
 * const searchArgs = new SearchArgs();
 * searchArgs.search = 'keyword';
 * const lists = await this.listsService.findAll(user, paginationArgs, searchArgs);
 *
 * const listId = '...'; // Provide the list id
 * const list = await this.listsService.findOne(listId, user);
 *
 * const updateListInput = new UpdateListInput();
 * updateListInput.name = 'Updated List Name';
 * const updatedList = await this.listsService.update(listId, updateListInput, user);
 *
 * const listIdToRemove = '...'; // Provide the list id to be removed
 * await this.listsService.remove(listIdToRemove);
 * @author Cuervolu
 */
@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}
  /**
   * Creates a new list associated with the provided user.
   *
   * @param {CreateListInput} createListInput - The input data for creating a new list.
   * @param {User} user - An object of type `User` representing the user who owns the list.
   * @returns {Promise<List>} A promise that resolves to the newly created list.
   */
  async create(createListInput: CreateListInput, user: User): Promise<List> {
    const newList = this.listRepository.create({ ...createListInput, user });

    return await this.listRepository.save(newList);
  }

  /**
   * Retrieves a paginated array of lists based on the user's roles and search criteria.
   *
   * @param {User} user - An object of type `User` representing the user for whom the lists are retrieved.
   * @param {PaginationArgs} paginationArgs - An object of type `PaginationArgs` containing the `limit` and `offset` properties to support pagination.
   * @param {SearchArgs} searchArgs - An object of type `SearchArgs` containing the `search` property for filtering lists based on a search term.
   * @returns {Promise<List[]>} A promise that resolves to an array of `List` objects matching the specified criteria.
   */
  async findAll(
    user: User,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<List[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listRepository
      .createQueryBuilder('lists')
      .where('lists.userId = :userId', { userId: user.id })
      .take(limit)
      .skip(offset);

    if (search) {
      queryBuilder.andWhere('LOWER(name) LIKE :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }

    return queryBuilder.getMany();
  }
  /**
   * Retrieves a single list by its id, if it belongs to the provided user.
   *
   * @param {string} id - The id of the list to retrieve.
   * @param {User} user - An object of type `User` representing the user who owns the list.
   * @returns {Promise<List>} A promise that resolves to the list object with the provided id.
   * @throws {NotFoundException} If the list with the given id does not exist or does not belong to the user.
   */
  async findOne(id: string, user: User): Promise<List> {
    const list = await this.listRepository.findOneBy({
      id,
      user: {
        id: user.id,
      },
    });

    if (!list) throw new NotFoundException(`List with id: ${id} not found`);

    return list;
  }

  /**
   * Updates the details of a list belonging to the provided user.
   *
   * @param {string} id - The id of the list to update.
   * @param {UpdateListInput} updateListInput - The input data for updating the list.
   * @param {User} user - An object of type `User` representing the user who owns the list.
   * @returns {Promise<List>} A promise that resolves to the updated list object.
   * @throws {NotFoundException} If the list with the given id does not exist or does not belong to the user.
   */
  async update(
    id: string,
    updateListInput: UpdateListInput,
    user: User,
  ): Promise<List> {
    // If the list doesn't exist or belongs to another user, an exception will be thrown, and the method will terminate.
    await this.findOne(id, user);
    const list = await this.listRepository.preload(updateListInput);

    if (!list) throw new NotFoundException(`Item with id: ${id} not found`);

    return this.listRepository.save(list);
  }

  /**
   * Removes a list with the specified id, if it belongs to the provided user.
   *
   * @param {string} id - The id of the list to be removed.
   * @param {User} user - An object of type `User` representing the user who owns the list.
   * @returns {Promise<List>} A promise that resolves to the removed list object with the provided id.
   * @throws {NotFoundException} If the list with the given id does not exist or does not belong to the user.
   */
  async remove(id: string, user: User): Promise<List> {
    /**
     * The code retrieves the list with the given id and user by calling the `findOne` method.
     * If the list is not found or does not belong to the user, a `NotFoundException` is thrown.
     * If the list is found and belongs to the user, it is removed from the database using the `remove` method of the `listRepository`.
     * The method then returns the removed list object along with its id.
     *
     * @see findOne
     */
    const list = await this.findOne(id, user);

    await this.listRepository.remove(list);

    return { ...list, id };
  }

  async listCountByUser(user: User): Promise<number> {
    return this.listRepository.count({
      where: {
        user: {
          id: user.id,
        },
      },
    });
  }
}
