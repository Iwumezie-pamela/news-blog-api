// api to Like a blog post

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Verify the access token and extract user data
    const verificationResult = await verifyToken(request);

    if (!verificationResult.success) {
      return NextResponse.json(
        { message: verificationResult.errorMessage },
        { status: 401 }
      );
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

    // Check if the post is already liked by the user
    const existingLike = await prisma.like.findUnique({
      where: {
        authorId_blogId: {
          authorId: verificationResult.data?.userId as string,
          blogId: blogId,
        },
      },
    });

    if (existingLike) {
      // If the post is already liked, remove the like (unlike)
      await prisma.like.delete({
        where: {
          authorId_blogId: {
            authorId: verificationResult.data?.userId as string,
            blogId: blogId,
          },
        },
      });
      return NextResponse.json(
        { message: 'Post unliked successfully.' },
        { status: 200 }
      );
    } else {
      // Create a new like record
      await prisma.like.create({
        data: {
          authorId: verificationResult.data?.userId as string,
          blogId: blogId,
        },
      });

      return NextResponse.json(
        { message: 'Post liked successfully.' },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

// api to fetch all liked posts
export async function GET(request: Request) {
  try {
    const verificationResult = await verifyToken(request);
    if (!verificationResult.success) {
      return NextResponse.json(
        { message: verificationResult.errorMessage },
        { status: 401 }
      );
    }
    const likedPosts = await prisma.like.findMany({
      where: {
        authorId: verificationResult.data?.userId,
      },
      select: {
        blog: {
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
          },
        },
      },
    });

    return NextResponse.json(likedPosts);
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
