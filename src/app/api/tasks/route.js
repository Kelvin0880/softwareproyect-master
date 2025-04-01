import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  let connection;
  
  try {
    // Obtener el token del usuario
    const token = request.cookies.get('token')?.value;
    const decoded = await verifyToken(token);
    
    connection = await createConnection();
    
    // Consulta según el rol
    let query = `
      SELECT 
        t.*,
        c.name as creator_name,
        a.name as assignee_name
      FROM tasks t
      JOIN users c ON t.created_by = c.id
      JOIN users a ON t.assigned_to = a.id
    `;
    
    // Si es empleado, filtrar solo sus tareas
    if (decoded.role !== 'admin') {
      query += ` WHERE t.assigned_to = ?`;
      const [tasks] = await connection.execute(query, [decoded.userId]);
      return NextResponse.json({ tasks });
    }
    
    // Si es admin, mostrar todas
    const [tasks] = await connection.execute(query);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las tareas' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// POST - Crear nueva tarea
export async function POST(request) {
  let connection;
  try {
    const data = await request.json();
    const { title, description, assigned_to, priority, status } = data;

    
    const token = request.cookies.get('token')?.value;
    const decoded = await verifyToken(token);

    connection = await createConnection();
    const [result] = await connection.execute(
      `INSERT INTO tasks (title, description, created_by, assigned_to, priority, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, decoded.userId, assigned_to, priority, status || 'pending']
    );

    return NextResponse.json({ 
      message: 'Tarea creada exitosamente',
      taskId: result.insertId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return NextResponse.json(
      { error: 'Error al crear la tarea' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}