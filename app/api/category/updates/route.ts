// Api to fetch categories with their corresponding blog updates

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

export async function GET(request: Request) {
  try {
    const verificationResult = await verifyToken(request);
    if (!verificationResult.success) {
      return new Response(
        JSON.stringify({ message: verificationResult.errorMessage }),
        { status: 401 }
      );
    }

    const userId = verificationResult.data?.userId;

    if (!userId) {
      return new Response(JSON.stringify({ message: 'User Id is required' }), {
        status: 401,
      });
    }

    const updates = await prisma.category.findMany({
      where: {
        lastChecked: {
          date: {
            lte: new Date(),
          },
        },
      },
      include: {
        lastChecked: {
          where: {
            authorId: userId,
          },
          select: {
            date: true,
          },
        },
      },
    });

    console.log({ updates });
    return new Response(JSON.stringify(updates), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
