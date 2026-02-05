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
      credentials: {},
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;
          
          // Note: In a real app we would check user.passwordHash. 
          // For the seed user, the hash is a placeholder string. 
          // If you created a user via register page, it has a real bcrypt hash.
          // Since we are using bcryptjs now, make sure the seed hash is valid or register a new user.
          
          if (!user.passwordHash) return null;

          const passwordsMatch = await comparePassword(password, user.passwordHash);
          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
