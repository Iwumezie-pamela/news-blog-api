import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Handle POST request
export async function POST(request: Request) {
  const { email, password,firstName,lastName } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email and password are required' },
      { status: 400 }
    );
  }

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName
      },
    });

    return NextResponse.json( newUser , { status: 201 });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return NextResponse.json(
      { message: 'Something went wrong', error: error },
      { status: 500 }
    );
  }
}