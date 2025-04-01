import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  // Esperamos a que los parámetros estén disponibles
  const { id } = await params;
  let connection;

  try {
    connection = await createConnection();

    // Verificar si el usuario existe antes de eliminarlo
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const [result] = await connection.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'No se pudo eliminar el usuario' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Usuario eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// También actualizamos el método PUT para mantener la consistencia
export async function PUT(request, { params }) {
  const { id } = await params;
  let connection;

  try {
    const body = await request.json();
    connection = await createConnection();

    // Verificar si el usuario existe
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Preparar datos para actualización
    const updateData = {
      username: body.username,
      email: body.email,
      name: body.name,
      role: body.role,
    };

    // Si se proporcionó una nueva contraseña, hashearla
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(body.password, salt);
    }

    // Construir query dinámicamente
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const query = `
      UPDATE users 
      SET ${fields.map(field => `${field} = ?`).join(', ')}
      WHERE id = ?
    `;

    await connection.execute(query, [...values, id]);

    return NextResponse.json({ 
      message: 'Usuario actualizado exitosamente' 
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}