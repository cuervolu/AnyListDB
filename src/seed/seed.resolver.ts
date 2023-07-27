import { Resolver, Mutation } from '@nestjs/graphql';
import { SeedService } from './seed.service';

/**
 * The `SeedResolver` is a NestJS resolver responsible for handling the GraphQL mutation to execute the database seed process.
 * It provides a single mutation `executeSeed` to initiate the seeding of users and items in the database.
 *
 * The resolver is decorated with `@Resolver()` to indicate that it is a GraphQL resolver.
 * The `executeSeed` mutation is decorated with `@Mutation()` and specifies the return type `Boolean`.
 * The description for the `executeSeed` mutation is provided to clarify its purpose.
 *
 * The resolver injects the `SeedService` to perform the actual seeding process.
 */
@Resolver()
export class SeedResolver {
  constructor(private readonly seedService: SeedService) {}

  /**
   * Execute the build of the database by seeding users and items.
   * This mutation initiates the database seeding process for testing and development purposes.
   *
   * @returns {Promise<boolean>} A promise that resolves to a boolean value of `true` after the seeding process is complete.
   */
  @Mutation(() => Boolean, {
    name: 'executeSeed',
    description:
      'Execute the build of the database by seeding users and items.',
  })
  async executeSeed(): Promise<boolean> {
    return this.seedService.executeSeed();
  }
}
