import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { LoginRequest } from '@/app/models/ILogin';

export async function POST(req: Request) {
  const body: LoginRequest = await req.json();

  if ((!body.email && !body.userName) || !body.password) {
    return new Response(
      JSON.stringify({ message: 'Email/Username and password are required' }),
      { status: 400 }
    );
  }

  try {
    // Determine whether the input is an email or username
    const isEmail = body.email?.includes('@');

    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: body.email }
        : { userName: body.userName as string },
    });

    if (!user) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
        status: 401,
      });
    }

    const isMatch = await bcrypt.compare(body.password, user.password);

    if (!isMatch) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
        status: 401,
      });
    }

    // Log the JWT_SECRET for debugging
    // console.log('JWT_SECRET:', process.env.JWT_SECRET);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    return new Response(JSON.stringify({ userId: user.id, token }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return new Response(
      JSON.stringify({ message: 'Something went wrong', error: error }),
      { status: 500 }
    );
  }
}
