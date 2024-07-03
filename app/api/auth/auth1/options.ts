import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'CredentialsProvider',
            credentials: {
                username: { label: "Username", type: "text", placeholder: "username" },
                password: { label: "Password", type: "password", placeholder: "password" }
            },
            async authorize(credentials, req) {
                const response = await fetch(`${process.env.SITE_URL}/api/ubuntu/checkubuntu`, {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                });
                const userData = await response.json();

                if (response.ok && userData) {
                    return userData;
                }
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.username = user.username;
                token.password = user.password;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.username = token.username as string;
                session.user.password = token.password as string;
            }
            return session;
        }
    },
    session: {
        strategy: 'jwt',
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    }
}
