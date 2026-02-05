import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { comparePassword } from '@/lib/auth';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        console.log("Authorize called with:", credentials?.email);
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await prisma.user.findUnique({ where: { email } });
          
          console.log("User found:", user ? "YES" : "NO");
          
          if (!user) return null;
          
          if (!user.passwordHash) {
             console.log("User has no password hash");
             return null;
          }

          const passwordsMatch = await comparePassword(password, user.passwordHash);
          console.log("Password match:", passwordsMatch);
          
          if (passwordsMatch) return user;
        } else {
            console.log("Zod parsing failed", parsedCredentials.error);
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
