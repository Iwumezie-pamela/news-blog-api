import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';

// API to fetch popular blogs based on likes
export async function GET(request: Request) {
  try {
    // Verify the access token and extract user data
    const verificationResult = await verifyToken(request);
    if (!verificationResult.success) {
      return NextResponse.json(
        { message: verificationResult.errorMessage },
        { status: 401 }
      );
    }
    // Fetch blogs with the count of likes, ordered by the count of likes in descending order
    const popularBlogs = await prisma.blog.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            like: true,
          },
        },
      },
      take: 10, // Limit to the top 10 popular blogs
    });

    return NextResponse.json(popularBlogs);
  } catch (error) {
    console.error('Error fetching popular blogs:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
