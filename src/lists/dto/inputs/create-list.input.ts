import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Represents the input data for creating a new list.
 *
 * @class CreateListInput
 * @since 1.5.0
 */
@InputType()
export class CreateListInput {
  /**
   * The name of the list to be created.
   *
   * @type {string}
   * @memberof CreateListInput
   * @since 1.5.0
   */
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;
}
