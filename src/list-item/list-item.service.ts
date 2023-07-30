import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateListItemInput, UpdateListItemInput } from './dto/inputs/';
import { ListItem } from './entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

/**
 * Service responsible for handling list item related operations.
 *
 * @class ListItemService
 * @since 1.5.0
 * @author Cuervolu
 */
@Injectable()
export class ListItemService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemsRepository: Repository<ListItem>,
  ) {}

  /**
   * Creates a new list item and associates it with the specified item and list.
   *
   * The `createListItemInput` parameter contains the necessary information to create the list item.
   * The `itemId` property identifies the item that the list item should be associated with.
   * The `listId` property identifies the list that the list item should be associated with.
   * The `rest` property contains the additional details of the list item.
   *
   * @param {CreateListItemInput} createListItemInput - The input object that contains the details of the new list item.
   * @returns {Promise<ListItem>} A promise that resolves to the newly created list item.
   * @memberof ListItemService
   * @since 1.5.0
   * @see CreateListItemInput
   * @see ListItem
   */
  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    const { itemId, listId, ...rest } = createListItemInput;

    const newListItem = this.listItemsRepository.create({
      ...rest,
      item: { id: itemId },
      list: { id: listId },
    });

    await this.listItemsRepository.save(newListItem);
    return this.findOne(newListItem.id);
  }

  /**
   * Retrieves a paginated array of list items belonging to a specific list. It supports pagination using the `PaginationArgs` object
   * and can filter list items based on the `SearchArgs` object.
   *
   * @param {List} list - An object of type `List` representing the list for which we want to find all list items.
   * The `List` object has a property `id` which is used to filter the list items.
   * @param {PaginationArgs} paginationArgs - An object of type `PaginationArgs` containing the `limit` and `offset` properties to support pagination.
   * The `limit` specifies the maximum number of list items to return, while the `offset` specifies the starting position of the data to be queried.
   * @param {SearchArgs} searchArgs - An object of type `SearchArgs` containing the `search` property for filtering list items based on a search term.
   * The `search` parameter allows filtering list items by the `name` of the associated `Item` using a case-insensitive search.
   * @returns {Promise<ListItem[]>} A promise that resolves to an array of `ListItem` objects matching the specified criteria.
   * @memberof ListItemService
   * @since 1.5.0
   * @see List
   * @see PaginationArgs
   * @see SearchArgs
   */
  async findAll(
    list: List,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listItemsRepository
      .createQueryBuilder('listItem') // <-- name for relations
      .innerJoin('listItem.item', 'item')
      .take(limit)
      .skip(offset)
      .where(`"listId" = :listId`, { listId: list.id });

    if (search) {
      //Added item.name to make reference to the name in the item
      queryBuilder.andWhere('LOWER(item.name) like :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }

    return queryBuilder.getMany();
  }
  /**
   * Retrieves the number of list items associated with a specific list.
   *
   * The `list` parameter is an object of type `List` representing the list for which we want to count the list items.
   * The `List` object has a property `id` which is used to identify the list.
   *
   * @param {List} list - The list object representing the list for which we want to count the list items.
   * @returns {Promise<number>} A promise that resolves to the number of list items associated with the specified list.
   * @memberof ListItemService
   * @since 1.5.0
   * @see List
   */

  async countListItemByList(list: List): Promise<number> {
    return this.listItemsRepository.count({
      where: { list: { id: list.id } },
    });
  }
  /**
   * Retrieves a single list item based on its ID.
   *
   * The `id` parameter is a string representing the unique identifier of the list item.
   *
   * @param {string} id - The ID of the list item to retrieve.
   * @returns {Promise<ListItem>} A promise that resolves to the `ListItem` object with the specified ID.
   * @throws {NotFoundException} If no list item is found with the specified ID.
   * @memberof ListItemService
   * @since 1.5.0
   */
  async findOne(id: string): Promise<ListItem> {
    const listItem = this.listItemsRepository.findOneBy({ id });

    if (!listItem)
      throw new NotFoundException(`List item with ID ${id} not found`);

    return listItem;
  }
  /**
   * Updates a list item in the database based on the provided ID and `UpdateListItemInput` object.
   *
   * @async
   * @function update
   * @param {string} id - The ID of the list item to be updated.
   * @param {UpdateListItemInput} updateListItemInput - An object of type `UpdateListItemInput` containing the properties
   * that should be updated for the list item. The `listId` and `itemId` properties, if present, will update the associated
   * list and item relationships, respectively.
   * @returns {Promise<ListItem>} A promise that resolves to the updated list item object.
   * @throws {NotFoundException} If no list item with the provided ID is found in the database.
   * @since 1.5.0
   * @see UpdateListItemInput
   */
  async update(
    id: string,
    updateListItemInput: UpdateListItemInput,
  ): Promise<ListItem> {
    const { listId, itemId, ...rest } = updateListItemInput;

    // Create a query builder to update the list item in the database
    const queryBuilder = this.listItemsRepository
      .createQueryBuilder() // Start building the query
      .update() // Specify that it's an update operation
      .set({
        ...rest, // Update the other properties of the list item
        ...(listId && { list: { id: listId } }), // If listId is provided, update the associated list relationship
        ...(itemId && { item: { id: itemId } }), // If itemId is provided, update the associated item relationship
      })
      .where('id = :id', { id }); // Set the WHERE condition to match the provided ID

    // if (listId) queryBuilder.set({ list: { id: listId } });
    // if (itemId) queryBuilder.set({ item: { id: itemId } });

    // Execute the update query in the database
    await queryBuilder.execute();

    // Return the updated list item by calling the `findOne` method
    return this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }
}
