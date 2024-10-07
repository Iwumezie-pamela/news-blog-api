import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';

// api to fetch all users
export async function GET(request: Request) {
  try {
    const user = verifyToken(request);
    if (typeof user === 'string') {
      return NextResponse.json({ message: user }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
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
