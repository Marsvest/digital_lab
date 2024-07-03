import NextAuth, { DefaultSession, ISODateString } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      username: string,
      password: string
    }

    expires: ISODateString
  }

  interface User {
    id: string,
    username: string,
    password: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string;
    password: string;
  }
}