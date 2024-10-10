import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';

// Api to Delete user
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const verificationResult = await verifyToken(req);
    if (!verificationResult.success) {
      return NextResponse.json(
        { message: verificationResult.errorMessage },
        { status: 401 }
      );
    }

    if (!params.id) {
      return NextResponse.json(
        { error: 'User id is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.log({ error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
