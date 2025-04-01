import { createConnection } from '@/lib/db';
import { sign } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    console.log('Intento de login con:', { 
      username,
      passwordLength: password.length 
    });

    const connection = await createConnection();
    
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      console.log('Usuario no encontrado');
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    const user = users[0];
    console.log('Usuario encontrado:', {
      username: user.username,
      storedHash: user.password
    });

    
    const salt = await bcrypt.genSalt(10);
    const testHash = await bcrypt.hash(password, salt);
    console.log('Comparando hashes:', {
      provided: testHash,
      stored: user.password
    });

    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Resultado de la validación:', validPassword);

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    const token = sign(
      { 
        userId: user.id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '8h' }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}