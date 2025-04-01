import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, email, password, name, role } = await request.json();

    // Verificar el rol del usuario que hace la petición (debe ser admin)
    // Aquí deberías implementar la verificación del token JWT
    
    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const connection = await createConnection();

    // Verificar si el usuario o email ya existe
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'El usuario o email ya existe' },
        { status: 400 }
      );
    }

    // Crear el nuevo usuario
    await connection.execute(
      'INSERT INTO users (id, username, email, password, name, role) VALUES (UUID(), ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, name, role]
    );

    return NextResponse.json(
      { message: 'Usuario creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { error: 'Error al crear el usuario' },
      { status: 500 }
    );
  }
}