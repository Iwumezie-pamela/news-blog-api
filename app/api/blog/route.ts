import { BlogRequest } from '@/app/models/BlogModel';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';

// POST /api/blog - Create a new blog post
export async function POST(req: Request) {
  try {
    // Verify the access token and extract user data
    const user = await verifyToken(req);

    // If token verification fails, return an unauthorized response
    /**
     * If user is not a string, it means the token is valid, and we can continue processing the request normally (e.g., creating the blog post with user.userId).
     */
    if (typeof user === 'string') {
      return NextResponse.json({ message: user }, { status: 401 });
    }

    // Parse and validate the request body
    const body: BlogRequest = await req.json();

    // Check if title and content are provided
    if (!body.title || !body.content) {
      return NextResponse.json(
        { message: 'Title and content are required fields.' },
        { status: 400 }
      );
    }

    // Create the new blog post in the database
    const newBlog = await prisma.blog.create({
      data: {
        ...body,
        authorId: user.userId,
      },
    });

    // Return the newly created blog post
    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
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
    const user = await verifyToken(req);

    // If token verification fails, return an unauthorized response
    if (typeof user === 'string') {
      return NextResponse.json({ message: user }, { status: 401 });
    }

    const posts = await prisma.blog.findMany({
      where: {
        authorId: user.userId,
      },
      include: {
        // like: {
        //   select: {
        //     id: true, // Select the ID of the like
        //   },
        // },
        like: true,
      },
    });

    const postsWithLikeCount = posts.map((post) => ({
      ...post,
      //   likeCount: post.like.length, // Count likes for each post
      like: post.like.length, // Count likes for each post
    }));

    return NextResponse.json(postsWithLikeCount);
  } catch (error) {
    console.error('Error retrieving blog posts:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
