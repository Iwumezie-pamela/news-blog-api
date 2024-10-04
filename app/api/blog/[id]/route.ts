import { BlogRequest } from '@/app/models/BlogModel';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: BlogRequest = await request.json();

    const user = await verifyToken(request);

    if (typeof user === 'string') {
      return NextResponse.json({ message: user }, { status: 401 });
    }
    const blogPost = await prisma.blog.findUnique({
      where: {
        id: params.id,
        authorId: user.userId,
      },
    });
    if (!blogPost) {
      return NextResponse.json(
        { message: 'Blog post not found.' },
        { status: 404 }
      );
    }

    // Update the blog post
    await prisma.blog.update({
      where: {
        id: params.id,
        authorId: user.userId,
      },
      data: body,
    });

    return NextResponse.json({ message: 'Blog updated sucessfully' });
  } catch (error) {
    console.log('Error updating blog post:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify the access token and extract user data
    const user = await verifyToken(req);

    if (typeof user === 'string') {
      return NextResponse.json({ message: user }, { status: 401 });
    }

    const blogPost = await prisma.blog.findUnique({
      where: {
        id: params.id,
        authorId: user.userId,
      },
    });
    if (!blogPost) {
      return NextResponse.json(
        { message: 'Blog post not found.' },
        { status: 404 }
      );
    }

    // Delete the blog post
    await prisma.blog.delete({
      where: {
        id: params.id,
        authorId: user.userId,
      },
    });

    // Return 204 No Content without a body
    return NextResponse.json({ message: 'Blog deleted sucessfully' });
  } catch (error) {
    console.log('Error deleting blog post:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
