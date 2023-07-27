import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateItemInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  /* *The commented code is defining a field called
`quantity` in the `CreateItemInput` class. It is specifying that the `quantity` field should be of
type `number` and should be a positive number. However, the code is currently commented out, so it
is not being used in the class. 
@deprecated This field is deprecated and no longer used. Please use another approach.
*/
  // @Field(() => Float)
  // @IsPositive()
  // quantity: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  quantityUnits?: string;
}
