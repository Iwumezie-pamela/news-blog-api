import { Prisma } from '@prisma/client';

export interface UserCreateInput {
  id: string;
  accessToken: string;
  expiresIn: Date;
  email: string;
  password: string;
}

const UserModel = Prisma.validator<Prisma.UserCreateInput>()({
  id: '',
  accessToken: '',
  expiresIn: '',
  email: '',
  password: '',
});

export type UserCreatePayload = UserCreateInput;

export default UserModel;
