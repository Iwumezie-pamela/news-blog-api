import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';

// api to fetch all users
export async function GET(req: Request) {
  try {
    const verificationResult = await verifyToken(req);

    if (!verificationResult.success) {
      return NextResponse.json(
        { message: verificationResult.errorMessage },
        { status: 401 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        image: true,
        userName: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
