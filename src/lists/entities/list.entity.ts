import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { ListItem } from 'src/list-item/entities/list-item.entity';

/**
 * Represents a list entity in the application.
 *
 * @class List
 * @since 1.5.0
 */
@Entity({ name: 'lists' })
@ObjectType()
export class List {
  /**
   * The unique identifier for the list.
   *
   * @type {string}
   * @memberof List
   * @since 1.5.0
   */
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  /**
   * The name of the list.
   *
   * @type {string}
   * @memberof List
   * @since 1.5.0
   */
  @Column()
  @Field(() => String)
  name: string;

  /**
   * The user associated with the list. Represents a many-to-one relationship with the User entity.
   *
   * @type {User}
   * @memberof List
   * @since 1.5.0
   */
  @ManyToOne(() => User, (user) => user.lists, { nullable: false, lazy: true })
  @Index('userId-list-index')
  @Field(() => User)
  user: User;

  /**
   * The list of list items associated with this list.
   *
   * Represents a one-to-many relationship with the ListItem entity, where a list can have multiple list items.
   * Each list item corresponds to an item in the list.
   *
   * @type {ListItem[]}
   * @memberof List
   * @since 1.5.0
   * @see ListItem
   */
  @OneToMany(() => ListItem, (listItem) => listItem.list, { lazy: true })
  // @Field(() => [ListItem])
  listItem: ListItem[];
}
