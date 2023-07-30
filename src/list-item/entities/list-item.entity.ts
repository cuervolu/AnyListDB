import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Item } from 'src/items/entities/item.entity';
import { List } from 'src/lists/entities/list.entity';

/**
 * Represents a list item entity in the application.
 *
 * A list item corresponds to an item in a list and stores information about the quantity and completion status.
 *
 * @class ListItem
 * @since 1.5.0
 * @author Cuervolu
 */
@Entity('listItems')
@Unique('listItem-item', ['list', 'item'])
@ObjectType()
export class ListItem {
  /**
   * The unique identifier for the list item.
   *
   * @type {string}
   * @memberof ListItem
   * @since 1.5.0
   */
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  /**
   * The quantity of the item in the list.
   *
   * @type {number}
   * @memberof ListItem
   * @since 1.5.0
   */
  @Column({ type: 'numeric' })
  @Field(() => Number)
  quantity: number;

  /**
   * The completion status of the list item.
   *
   * @type {boolean}
   * @memberof ListItem
   * @since 1.5.0
   */
  @Column({ type: 'boolean' })
  @Field(() => Boolean)
  completed: boolean;

  /**
   * The list to which this list item belongs.
   *
   * Represents a many-to-one relationship with the List entity, where each list item is associated with a single list.
   *
   * @type {List}
   * @memberof ListItem
   * @since 1.5.0
   * @see List
   */
  @ManyToOne(() => List, (list) => list.listItem, { lazy: true })
  @Field(() => List)
  list: List;

  /**
   * The item associated with this list item.
   *
   * Represents a many-to-one relationship with the Item entity, where each list item corresponds to an item.
   *
   * @type {Item}
   * @memberof ListItem
   * @since 1.5.0
   * @see Item
   */
  @ManyToOne(() => Item, (item) => item.listItem, { lazy: true })
  @Field(() => Item)
  item: Item;
}
