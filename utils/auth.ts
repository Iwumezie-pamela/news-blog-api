/* eslint-disable @typescript-eslint/no-unused-vars */
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// Define the structure of the user payload
interface UserPayload {
  userId: string;
}

// Function to verify the token
export async function verifyToken(
  req: Request
): Promise<UserPayload | string> {
  const authHeader = req.headers.get('Authorization');

  const token = authHeader?.split(' ')[1]; // Bearer <token>
  if (!token) {
    return 'No token provided';
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserPayload;
    return decoded; // Ensure this returns an object containing userId
  } catch (error) {
    return 'Invalid or expired token';
  }
}
