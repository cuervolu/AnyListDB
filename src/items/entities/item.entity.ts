import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Represents an item entity in the application.
 *
 * An item corresponds to an individual item that can be added to lists. It stores information such as the item's name and quantity units.
 *
 * @class Item
 * @since 1.5.0
 * @author Cuervolu
 */
@Entity({ name: 'items' })
@ObjectType()
export class Item {
  /**
   * The unique identifier for the item.
   *
   * @type {string}
   * @memberof Item
   * @since 1.5.0
   */
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  /**
   * The name of the item.
   *
   * @type {string}
   * @memberof Item
   * @since 1.5.0
   */
  @Column()
  @Field(() => String)
  name: string;

  /**
   * The quantity units of the item.
   *
   * This field stores the unit of measurement for the item's quantity, e.g., grams (g), milliliters (ml), kilograms (kg), teaspoons (tsp), etc.
   *
   * @type {string}
   * @memberof Item
   * @since 1.5.0
   */
  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  quantityUnits?: string; //g,ml,kg,tsp

  /**
   * The user who owns or is associated with the item.
   *
   * Represents a many-to-one relationship with the User entity, where each item is associated with a single user.
   *
   * @type {User}
   * @memberof Item
   * @since 1.5.0
   * @see User
   */
  @ManyToOne(() => User, (user) => user.items, { nullable: false, lazy: true })
  @Index('userId-Index')
  @Field(() => User)
  user: User;

  /**
   * The list items associated with this item.
   *
   * Represents a one-to-many relationship with the ListItem entity, where each item may have multiple list items.
   *
   * @type {ListItem[]}
   * @memberof Item
   * @since 1.5.0
   * @see ListItem
   */
  @OneToMany(() => ListItem, (listItem) => listItem.item, { lazy: true })
  @Field(() => [ListItem])
  listItem: ListItem[];
}
