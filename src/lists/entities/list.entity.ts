import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from 'src/users/entities/user.entity';

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
}
