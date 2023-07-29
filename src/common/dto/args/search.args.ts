import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

/**
 * Represents the arguments for a search query in GraphQL.
 *
 * @class
 * @description The `SearchArgs` class is used as arguments for a search query in GraphQL.
 * It supports filtering results based on a search term.
 * @since 1.0.0
 * @example
 * ```ts
 * // Example usage in a resolver:
 * @Query(() => [Post], { name: 'searchPosts' })
 * async searchPosts(@Args() searchArgs: SearchArgs): Promise<Post[]> {
 *   // Your search logic here...
 * }
 * ```
 */
@ArgsType()
export class SearchArgs {
  /**
   * The search term used to filter the search results.
   *
   * @type {string}
   * @default undefined
   * @since 1.0.0
   * @example
   * // Example usage:
   * const searchArgs = new SearchArgs();
   * searchArgs.search = 'keyword';
   */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}
