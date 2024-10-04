// api to Like a blog post

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Verify the access token and extract user data
    const user = await verifyToken(request);

    if (typeof user === 'string') {
      return NextResponse.json({ message: user }, { status: 401 });
    }

    // get blog post id from url
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');

    if (!blogId) {
      return NextResponse.json(
        { message: 'Blog Id is required.' },
        { status: 400 }
      );
    }

    // Check if the blog post exists
    const blogPostExist = await prisma.blog.findUnique({
      where: {
        id: blogId,
      },
    });

    if (!blogPostExist) {
      return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
    }

    // Create a new like record
    await prisma.like.create({
      data: {
        authorId: user.userId,
        blogId: blogId,
      },
    });

    return NextResponse.json(
      { message: 'Post liked successfully.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
