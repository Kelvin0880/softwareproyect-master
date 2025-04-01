import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = verify(token, process.env.JWT_SECRET);

    return NextResponse.json({
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    );
  }
}