// Purpose: Service for interacting with the Token model.

import { prisma } from '@/lib/prisma';
import { UserCreatePayload } from '../models/UserModel';
import bcrypt from 'bcryptjs';

export const createOrUpdateUser = async (data: UserCreatePayload) => {
  const { id, email, accessToken, expiresIn, password } = data;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log({ hashedPassword });
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    // Update the existing record
    return prisma.user.update({
      where: {
        email,
      },
      data: {
        accessToken: accessToken,
        expiresIn: expiresIn,
      },
    });
  } else {
    // Create a new record
    return prisma.user.create({
      data: {
        id: id,
        accessToken: accessToken,
        expiresIn: expiresIn,
        email: email,
        password: hashedPassword,
      },
    });
  }
};
