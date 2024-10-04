// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth/next";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string | null | undefined;
            firstName: string | null | undefined;
            lastName: string | null | undefined;
            name: string | null | undefined;
            email: string | null | undefined;
            image: string | null | undefined;
            username: string | null | undefined;
            idToken: string | null | undefined;
            accessToken: string | null | undefined;
        }
    }

    interface User {
        accessToken: string | null | undefined;
    }
}