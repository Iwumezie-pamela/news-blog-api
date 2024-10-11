import { BlogRequest } from '@/app/models/BlogModel';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';

// POST /api/blog - Create a new blog post
export async function POST(req: Request) {
  try {
    // Verify the access token and extract user data
    const verificationResult = await verifyToken(req);

    /**
     * If user is not a string, it means the token is valid, and we can continue processing the request normally (e.g., creating the blog post with user.userId).
     */
    if (!verificationResult.success) {
      return NextResponse.json(
        { message: verificationResult.errorMessage },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body: BlogRequest = await req.json();

    // Check if title and content are provided
    if (!body.title || !body.content || !body.categoryId) {
      return NextResponse.json(
        { message: 'Title, content and category are required fields.' },
        { status: 400 }
      );
    }
    // Check if title exist
    const existingTitle = await prisma.blog.findFirst({
      where: {
        title: body.title,
        authorId: verificationResult.data?.userId,
      },
    });

    if (existingTitle) {
      return NextResponse.json(
        {
          message:
            'You have already used this title. Please choose a different one.',
        },
        { status: 400 }
      );
    }

    // Verify category exists
    const existingCategory = await prisma.category.findUnique({
      where: {
        id: body.categoryId,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'The selected category does not exist.' },
        { status: 400 }
      );
    }

    // Add the collaborator IDs if any are provided
    const collaborators = body.collaborators
      ? body.collaborators.map((id) => ({ id })) // Wrap each collaborator ID in an object
      : [];

    // Create the new blog post in the database
    const newBlog = await prisma.blog.create({
      data: {
        ...body,
        authorId: verificationResult.data?.userId as string,
        categoryId: body.categoryId,
        collaborators:
          collaborators.length > 0
            ? {
                connect: collaborators,
              }
            : {},
      },
      include: {
        collaborators: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await prisma.categoryLastChecked.create({
      data: {
        authorId: verificationResult.data?.userId as string,
        categoryId: body.categoryId,
        date: new Date(),
      },
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.log('Error creating blog post:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

// GET /api/blog - Get all blog posts
export async function GET(req: Request) {
  try {
    // Verify the access token and extract user data
    // Verify the access token and extract user data
    const verificationResult = await verifyToken(req);

    // If token verification fails, return an unauthorized response
    if (!verificationResult.success) {
      return NextResponse.json(
        { message: verificationResult.errorMessage },
        { status: 401 }
      );
    }

    const posts = await prisma.blog.findMany({
      //   where: {
      //     authorId: verificationResult.data?.userId,
      //   },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
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
            email: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            like: true,
          },
        },
      },
    });

    const postsResponse = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      image: post.image,
      createdAt: post.createdAt,
      author: `${post.author.firstName} ${post.author.lastName}`,
      like: post._count.like, // Count likes for each post
      collaborators: post.collaborators,
      category: post.category,
    }));

    return NextResponse.json(postsResponse);
  } catch (error) {
    console.error('Error retrieving blog posts:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
