import { BlogRequest } from '@/app/models/BlogModel';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';

// Api to fetch a single blog post
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const verificationResult = await verifyToken(request);
    if (!verificationResult.success) {
      return NextResponse.json(
        { message: verificationResult.errorMessage },
        { status: 401 }
      );
    }

    if (!params.id) {
      NextResponse.json({ error: 'Blog id is required' }, { status: 400 });
    }

    const post = await prisma.blog.findUnique({
      where: {
        id: params.id,
        authorId: verificationResult.data?.userId,
      },
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
        collaborators: {
          select: {
            id: true,
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
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: BlogRequest = await request.json();

    const verificationResult = await verifyToken(request);

    if (!verificationResult.success) {
      return NextResponse.json(
        { message: verificationResult.errorMessage },
        { status: 401 }
      );
    }
    const blogPost = await prisma.blog.findUnique({
      where: {
        id: params.id,
        authorId: verificationResult.data?.userId,
      },
      include: {
        collaborators: true,
      },
    });
    if (!blogPost) {
      return NextResponse.json(
        { message: 'Blog post not found.' },
        { status: 404 }
      );
    }

    const existingCollaboratorIds = blogPost.collaborators.map(
      (collaborator) => collaborator.id
    ); // Current collaborator IDs
    const newCollaboratorIds = body.collaborators || []; // New collaborators from request body

    // Determine collaborators to connect and disconnect
    const collaboratorsToConnect = newCollaboratorIds
      .filter((id) => !existingCollaboratorIds.includes(id))
      .map((id) => ({ id }));
    const collaboratorsToDisconnect = existingCollaboratorIds
      .filter((id) => !newCollaboratorIds.includes(id))
      .map((id) => ({ id }));

    // Update the blog post
    await prisma.blog.update({
      where: {
        id: params.id,
        authorId: verificationResult.data?.userId,
      },
      data: {
        ...body,
        collaborators: {
          connect: collaboratorsToConnect,
          disconnect: collaboratorsToDisconnect,
        },
      },
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
    const verificationResult = await verifyToken(req);

    if (!verificationResult.success) {
      return NextResponse.json(
        { message: verificationResult.errorMessage },
        { status: 401 }
      );
    }

    const blogPost = await prisma.blog.findUnique({
      where: {
        id: params.id,
        authorId: verificationResult.data?.userId,
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
        authorId: verificationResult.data?.userId,
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
