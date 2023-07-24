import { registerEnumType } from '@nestjs/graphql';

/* The code is defining an enum called `ValidRoles` with three possible values: `admin`, `user`, and
`superUser`. Each value is assigned a string value that corresponds to its name. */
export enum ValidRoles {
  admin = 'admin',
  user = 'user',
  superUser = 'superUser',
}

/* Registers the`ValidRoles` enum with the GraphQL schema. It tells the GraphQL schema that there is an enum called
`ValidRoles` and assigns it the name `'ValidRoles'`. This allows the enum to be used in GraphQL
queries and mutations. */
registerEnumType(ValidRoles, {
  name: 'ValidRoles',
  description:
    'The ValidRoles enum represents the possible roles for a user in the application. The values are admin, user, and superUser.\n\n Admin users have full control over the application. They can create, update, and delete users, roles, and other resources.\n* User users have limited access to the application. They can create and edit their own profiles, and they can view and participate in discussions.\n* SuperUser users have the same permissions as admin users, but they also have the ability to grant and revoke roles to other users.',
});
