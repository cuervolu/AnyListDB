import { InputType, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

/**
 * Represents an input object type for creating a new list item in the application.
 * This class is used as a parameter for the `createListItem` mutation in GraphQL.
 *
 * @class CreateListItemInput
 * @since 1.5.0
 * @author Cuervolu
 */
@InputType()
export class CreateListItemInput {
  /**
   * The quantity of the list item.
   *
   * @type {number}
   * @memberof CreateListItemInput
   * @since 1.5.0
   */
  @Field(() => Number, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity = 0;

  /**
   * The completion status of the list item.
   *
   * @type {boolean}
   * @memberof CreateListItemInput
   * @since 1.5.0
   */
  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  completed = false;

  /**
   * The ID of the list to which the list item belongs.
   *
   * @type {string}
   * @memberof CreateListItemInput
   * @since 1.5.0
   */
  @Field(() => ID)
  @IsUUID()
  listId: string;

  /**
   * The ID of the item associated with the list item.
   *
   * @type {string}
   * @memberof CreateListItemInput
   * @since 1.5.0
   */
  @Field(() => ID)
  @IsUUID()
  itemId: string;
}
