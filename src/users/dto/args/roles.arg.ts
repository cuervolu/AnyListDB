import { ArgsType, Field } from '@nestjs/graphql';
import { IsArray } from 'class-validator';

import { ValidRoles } from '../../../auth/enums/valid-roles.enum';

/* The ValidRolesArgs class is a TypeScript class that represents an argument type for a GraphQL query,
containing an array of valid roles. */
@ArgsType()
export class ValidRolesArgs {
  @Field(() => [ValidRoles], { nullable: true })
  @IsArray()
  roles: ValidRoles[] = [];
}
