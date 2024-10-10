import { UserProfileRequest } from '@/app/models/UserProfile';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';

// Api to fetch logged in user profile
export async function GET(request: Request) {
  try {
    const verificationResult = await verifyToken(request);
    if (!verificationResult.success) {
      return NextResponse.json(
        { message: verificationResult.errorMessage },
        { status: 401 }
      );
    }

    const userProfile = await prisma.user.findUnique({
      where: {
        id: verificationResult.data?.userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userName: true,
        phoneNumber: true,
        image: true,
      },
    });

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Api to update user profile
export async function PATCH(request: Request) {
  try {
    const verificationResult = await verifyToken(request);
    if (!verificationResult.success) {
      return NextResponse.json(
        { message: verificationResult.errorMessage },
        { status: 401 }
      );
    }

    const body: UserProfileRequest = await request.json();

    // Throw an error if the email field is included in the request body
    if (body.email) {
      return NextResponse.json(
        { message: 'Email update is not allowed' },
        { status: 400 }
      );
    }

    const updateProfile = await prisma.user.update({
      where: {
        id: verificationResult.data?.userId,
      },
      data: body,
      select: {
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        userName: true,
        image: true,
      },
    });

    return NextResponse.json(updateProfile);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
