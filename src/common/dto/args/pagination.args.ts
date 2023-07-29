import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional, Min } from 'class-validator';

/**
 * @description Represents the pagination arguments for GraphQL queries.
 * @since 1.0.0
 * @author Cuervolu
 */
@ArgsType()
export class PaginationArgs {
  /**
   * @description The offset specifies the starting position of the data to be queried.
   * @type {number}
   * @default 10
   * @since 1.0.0
   */
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0)
  offset = 10;

  /**
   * @description The limit specifies the maximum number of items to be queried.
   * @type {number}
   * @default 10
   * @since 1.0.0
   */
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  limit = 10;
}
