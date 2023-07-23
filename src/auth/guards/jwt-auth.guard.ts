import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

/* The JwtAuthGuard class is a custom authentication guard that extends the AuthGuard class and
overrides the getRequest method to extract the request object from the GraphQL execution context. */
export class JwtAuthGuard extends AuthGuard('jwt') {
  //! Override
  /**
   * The getRequest function returns the request object from the GraphQL execution context.
   * @param {ExecutionContext} context - The context parameter is an execution context object that
   * contains information about the current execution environment. In this case, it is used to create a
   * GraphQL execution context using the GqlExecutionContext.create() method.
   * @returns the request object from the context.
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request;
  }
}
