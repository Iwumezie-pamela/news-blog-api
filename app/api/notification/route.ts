import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';

// Api to fetch notifications
export async function GET(request: Request) {
  try {
    const verificationResult = await verifyToken(request);
    if (!verificationResult.success) {
      return new Response(
        JSON.stringify({ message: verificationResult.errorMessage }),
        {
          status: 401,
        }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: verificationResult.data?.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        message: true,
        createdAt: true,
      },
    });

    return new Response(JSON.stringify(notifications), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

// Api to delete all notifications
export async function DELETE(request: Request) {
  try {
    const verificationResult = await verifyToken(request);
    if (!verificationResult.success) {
      return new Response(
        JSON.stringify({ message: verificationResult.errorMessage }),
        {
          status: 401,
        }
      );
    }

    await prisma.notification.deleteMany({
      where: {
        userId: verificationResult.data?.userId,
      },
    });

    return new Response(JSON.stringify({ message: 'Notifications deleted' }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
