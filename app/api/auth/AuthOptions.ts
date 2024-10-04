/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import NextAuth, { AuthOptions } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { useLogin } from '../apiClient';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createOrUpdateUser } from '../../services/UserService';
import bcrypt from 'bcryptjs';

export const prisma = new PrismaClient();

const login = useLogin();

export const authOptions: AuthOptions = {
  session: {
    // Set cookie to expire in 23 hours - Change to same time the access token expires at
    maxAge: 23 * 60 * 60,
    updateAge: 0,
  },
  providers: [
    CredentialsProvider({
      name: 'Sign in',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'hello@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        let retrievedId: string | null = null;

        // If email or password is missing, return null to display an error
        if (!credentials?.email || !credentials.password) {
          // Send error message to client
          throw new Error('Email and password are required');
        }

        // If email and password is available, continue to attempt to log in
        try {
          const response = await login({
            email: credentials?.email as string,
            password: credentials?.password as string,
          });

          console.log('response.data.token: ', response.data.token);
          console.log('response.data.userId: ', response.data.userId);

          if (response) {
            retrievedId = response.data.userId;
            await createOrUpdateUser({
              id: retrievedId as string,
              email: credentials.email,
              accessToken: response.data.token,
              password: credentials.password,
              // Set expiry date to 24 hours from now
              expiresIn: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
          }
        } catch (error: any) {
          if (error.response) {
            // Send error message to client
            throw new Error(error.response.data.detail);
          }
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            id: retrievedId as string,
          },
        });

        if (!user) {
          console.log('User does not exist!');
          return null;
        }
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.log('Invalid password');
          throw new Error('Invalid password');
        }

        // Return user object to be stored in JWT
        return {
          id: user.id + '',
          email: credentials.email,
          accessToken: user.accessToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.idToken = user.id;
      }

      // Return token
      return token;
    },
    // Create and manage sessions here
    async session({ session, token }) {
      console.log('Session Callback', { session, token });
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          token: token.accessToken,
        },
      };
    },
  },
  secret: process.env.SECRET,
  pages: {
    signIn: '/login',
  },
};

export default NextAuth(authOptions);
