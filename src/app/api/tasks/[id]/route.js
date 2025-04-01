import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  const { id } = await params;
  let connection;
  
  try {
    const data = await request.json();
    connection = await createConnection();

    // Si solo estamos actualizando el status (drag and drop)
    if (Object.keys(data).length === 1 && data.status) {
      await connection.execute(
        'UPDATE tasks SET status = ? WHERE id = ?',
        [data.status, id]
      );
    } else {
      // Actualización completa de la tarea
      const { title, description, assigned_to, priority, status } = data;
      await connection.execute(
        `UPDATE tasks 
         SET title = ?, description = ?, assigned_to = ?, priority = ?, status = ?
         WHERE id = ?`,
        [title, description, assigned_to, priority, status, id]
      );
    }

    // Obtener la tarea actualizada
    const [updatedTasks] = await connection.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    return NextResponse.json({ 
      message: 'Tarea actualizada exitosamente',
      task: updatedTasks[0]
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la tarea' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}