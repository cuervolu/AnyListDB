import { IsUUID } from 'class-validator';
import { CreateListInput } from './';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

/**
 * Represents the input data for updating a list.
 *
 * @class UpdateListInput
 * @extends {PartialType(CreateListInput)}
 * @since 1.5.0
 * @see PartialType
 */
@InputType()
export class UpdateListInput extends PartialType(CreateListInput) {
  /**
   * The unique identifier of the list to be updated.
   *
   * @type {string}
   * @memberof UpdateListInput
   * @since 1.5.0
   */
  @Field(() => ID)
  @IsUUID()
  id: string;
}
