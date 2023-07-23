/* The code is defining an interface named `JwtPayload` that describes the structure of a JSON Web
Token (JWT) payload. */
export interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}
