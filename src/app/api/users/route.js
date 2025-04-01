import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  let connection;
  try {
    console.log('⌛ Intentando conectar a la base de datos...');
    connection = await createConnection();
    console.log('✅ Conexión exitosa a la base de datos');

    console.log('⌛ Ejecutando consulta SQL...');
    const [users] = await connection.execute(
      'SELECT id, username, email, name, role, created_at FROM users'
    );
    console.log('✅ Consulta ejecutada. Usuarios encontrados:', users.length);

    return NextResponse.json({ 
      success: true,
      users 
    });
  } catch (error) {
    console.error('❌ Error en GET /api/users:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al obtener usuarios: ' + error.message 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('✅ Conexión cerrada correctamente');
      } catch (err) {
        console.error('❌ Error al cerrar la conexión:', err);
      }
    }
  }
}