import { IsUUID } from 'class-validator';
import { CreateListItemInput } from './create-list-item.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

/**
 * Represents an input object type for updating a list item in the application.
 * This class extends the `PartialType` of `CreateListItemInput` and is used as a parameter
 * for the `updateListItem` mutation in GraphQL.
 *
 * @class UpdateListItemInput
 * @extends PartialType<CreateListItemInput>
 * @since 1.5.0
 * @author Cuervolu
 */
@InputType()
export class UpdateListItemInput extends PartialType(CreateListItemInput) {
  /**
   * The ID of the list item to be updated.
   *
   * @type {string}
   * @memberof UpdateListItemInput
   * @since 1.5.0
   */
  @Field(() => ID)
  @IsUUID()
  id: string;
}
