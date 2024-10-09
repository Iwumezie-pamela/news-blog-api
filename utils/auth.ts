/* eslint-disable @typescript-eslint/no-unused-vars */
import { OperationResult } from '@/app/models/IOperationResult';
import jwt from 'jsonwebtoken';

// Define the structure of the user payload
interface UserPayload {
  userId: string;
  exp?: number;
}

export interface AuthError {
  errorMessage: string;
}

// Function to verify the token
export async function verifyToken(
  req: Request
): Promise<OperationResult<UserPayload>> {
  const authHeader = req.headers.get('Authorization');

  const token = authHeader?.split(' ')[1]; // [Bearer] [<token>]
  if (!token) {
    return {
      success: false,
      errorMessage: 'No token provided',
    };
  }

  try {
    // Decode the token
    const decoded = jwt.decode(token) as UserPayload;

    // Check if token has expired (exp is in seconds, it will be multiplied by 1000 to convert to milliseconds)
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return {
        success: false,
        errorMessage: 'Token has expired',
      };
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET as string);

    // Return the decoded token
    return {
      success: true,
      data: decoded,
    };
  } catch (error) {
    return {
      success: false,
      errorMessage: 'Invalid token',
    };
  }
}
