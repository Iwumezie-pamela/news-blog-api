import { CategoryRequest } from '@/app/models/ICategory';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

// Api to Fetch blogs under a specific category
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const verificationResult = await verifyToken(request);
    if (!verificationResult.success) {
      return new Response(
        JSON.stringify({ message: verificationResult.errorMessage }),
        { status: 401 }
      );
    }

    const categoryId = params.id;
    if (!categoryId) {
      return new Response(
        JSON.stringify({ message: 'Category id is required' }),
        {
          status: 400,
        }
      );
    }

    const blogs = await prisma.blog.findMany({
      where: {
        categoryId: categoryId,
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

    return new Response(JSON.stringify(blogs), { status: 200 });
  } catch (error) {
    console.log({ error });
    return new Response(JSON.stringify({ message: 'Error fetching blogs' }), {
      status: 500,
    });
  }
}

// Api to update blog category
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const verificationResult = await verifyToken(request);
    if (!verificationResult.success) {
      return new Response(
        JSON.stringify({ message: verificationResult.errorMessage }),
        { status: 401 }
      );
    }

    if (!params.id) {
      return new Response(
        JSON.stringify({ error: 'Category id is required' }),
        { status: 400 }
      );
    }

    const body: CategoryRequest = await request.json();

    await prisma.category.update({
      where: {
        id: params.id,
      },
      data: body,
    });

    return new Response(
      JSON.stringify({ message: 'Category updated successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.log({ error });
    return new Response(
      JSON.stringify({ message: 'Error updating category' }),
      { status: 500 }
    );
  }
}

// Api to delete blog category
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const verificationResult = await verifyToken(request);
    if (!verificationResult.success) {
      return new Response(
        JSON.stringify({ message: verificationResult.errorMessage }),
        { status: 401 }
      );
    }

    if (!params.id) {
      return new Response(
        JSON.stringify({ error: 'Category id is required' }),
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: {
        id: params.id,
      },
    });

    return new Response(
      JSON.stringify({ message: 'Category deleted successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.log({ error });
    return new Response(
      JSON.stringify({ message: 'Error deleting category' }),
      { status: 500 }
    );
  }
}
