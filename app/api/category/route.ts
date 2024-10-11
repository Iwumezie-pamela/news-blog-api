import { CategoryRequest } from '@/app/models/ICategory';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

// Api to create blog category
export async function POST(request: Request) {
  try {
    const verificationResult = await verifyToken(request);
    if (!verificationResult.success) {
      return new Response(
        JSON.stringify({ message: verificationResult.errorMessage }),
        { status: 401 }
      );
    }

    const body: CategoryRequest = await request.json();

    // Check for existing category
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: body.name,
      },
    });

    if (existingCategory) {
      return new Response(
        JSON.stringify({ message: 'Category already exists' }),
        { status: 409 }
      );
    }

    const createCategory = await prisma.category.create({
      data: body,
    });

    return new Response(JSON.stringify(createCategory), { status: 201 });
  } catch (error) {
    console.log({ error });
    return new Response(
      JSON.stringify({ message: 'Error creating category' }),
      { status: 500 }
    );
  }
}

// Api to fetch all blog categories
export async function GET(request: Request) {
  try {
    const verificationResult = await verifyToken(request);
    if (!verificationResult.success) {
      return new Response(
        JSON.stringify({ message: verificationResult.errorMessage }),
        { status: 401 }
      );
    }

    const categories = await prisma.category.findMany({
      select: {
        blogs: true,
      },
    });


    return new Response(JSON.stringify(categories), { status: 200 });
  } catch (error) {
    console.log({ error });
    return new Response(
      JSON.stringify({ message: 'Error fetching categories' }),
      { status: 500 }
    );
  }
}
