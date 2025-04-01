// /app/api/reports/user/[id]/route.js
import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  let connection;
  
  try {
    // Verificar autenticación y rol de admin
    const token = request.cookies.get('token')?.value;
    const decoded = await verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    const userId = params.id;
    
    // Verificar si el ID es válido
    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario no válido' },
        { status: 400 }
      );
    }
    
    connection = await createConnection();
    
    // Obtener información del usuario
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    const user = users[0];
    
    // Obtener tareas del usuario
    const [tasks] = await connection.execute(
      `SELECT 
        t.*,
        c.name as creator_name,
        a.name as assignee_name
      FROM tasks t
      JOIN users c ON t.created_by = c.id
      JOIN users a ON t.assigned_to = a.id
      WHERE t.assigned_to = ?`,
      [userId]
    );
    
    // Generar el PDF
    const doc = new jsPDF();
    let yPos = 20;
    
    // Título del reporte
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);
    doc.text(`Reporte Detallado de Usuario: ${user.name}`, 14, yPos);
    yPos += 10;
    
    // Fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, 14, yPos);
    yPos += 15;
    
    // Información del usuario
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Información del Usuario', 14, yPos);
    yPos += 10;
    
    const userData = [
      ['ID', user.id ? user.id.substring(0, 8) + '...' : 'N/A'],
      ['Nombre', user.name],
      ['Usuario', user.username],
      ['Email', user.email],
      ['Rol', user.role === 'admin' ? 'Administrador' : 'Empleado'],
      ['Fecha de Registro', user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'],
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Campo', 'Valor']],
      body: userData,
      theme: 'grid',
      headStyles: { fillColor: [41, 98, 255], textColor: [255, 255, 255] },
      margin: { left: 14 },
      styles: { fontSize: 10 },
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Resumen de tareas
    if (tasks.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Resumen de Tareas', 14, yPos);
      yPos += 10;
      
      // Agrupar tareas por estado
      const pendingTasks = tasks.filter(task => task.status === 'pending');
      const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
      const reviewTasks = tasks.filter(task => task.status === 'review');
      const completedTasks = tasks.filter(task => task.status === 'completed');
      
      const taskSummary = [
        ['Total de Tareas', tasks.length.toString()],
        ['Tareas Pendientes', pendingTasks.length.toString()],
        ['Tareas En Progreso', inProgressTasks.length.toString()],
        ['Tareas En Revisión', reviewTasks.length.toString()],
        ['Tareas Completadas', completedTasks.length.toString()]
      ];
      
      doc.autoTable({
        startY: yPos,
        head: [['Categoría', 'Cantidad']],
        body: taskSummary,
        theme: 'grid',
        headStyles: { fillColor: [41, 98, 255], textColor: [255, 255, 255] },
        margin: { left: 14 },
        styles: { fontSize: 10 },
      });
      
      yPos = doc.lastAutoTable.finalY + 20;
      
      // SECCIÓN DE TAREAS PENDIENTES
      if (pendingTasks.length > 0) {
        // Si estamos cerca del final de la página, añadir una nueva
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(33, 33, 33);
        doc.text('Tareas Pendientes', 14, yPos);
        yPos += 10;
        
        const pendingTasksData = pendingTasks.map(task => [
          task.title,
          task.description.length > 70 ? task.description.substring(0, 67) + '...' : task.description,
          task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja',
          new Date(task.created_at).toLocaleDateString('es-ES'),
          task.creator_name
        ]);
        
        doc.autoTable({
          startY: yPos,
          head: [['Título', 'Descripción', 'Prioridad', 'Fecha de Creación', 'Creador']],
          body: pendingTasksData,
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255] },
          margin: { left: 14 },
          styles: { fontSize: 9, cellPadding: 3, overflow: 'ellipsize' },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' }
          }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
      }
      
      // SECCIÓN DE TAREAS EN PROGRESO
      if (inProgressTasks.length > 0) {
        // Si estamos cerca del final de la página, añadir una nueva
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(33, 33, 33);
        doc.text('Tareas En Progreso', 14, yPos);
        yPos += 10;
        
        const inProgressTasksData = inProgressTasks.map(task => [
          task.title,
          task.description.length > 70 ? task.description.substring(0, 67) + '...' : task.description,
          task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja',
          new Date(task.created_at).toLocaleDateString('es-ES'),
          task.creator_name
        ]);
        
        doc.autoTable({
          startY: yPos,
          head: [['Título', 'Descripción', 'Prioridad', 'Fecha de Creación', 'Creador']],
          body: inProgressTasksData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
          margin: { left: 14 },
          styles: { fontSize: 9, cellPadding: 3, overflow: 'ellipsize' },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' }
          }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
      }
      
      // SECCIÓN DE TAREAS EN REVISIÓN
      if (reviewTasks.length > 0) {
        // Si estamos cerca del final de la página, añadir una nueva
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(33, 33, 33);
        doc.text('Tareas En Revisión', 14, yPos);
        yPos += 10;
        
        const reviewTasksData = reviewTasks.map(task => [
          task.title,
          task.description.length > 70 ? task.description.substring(0, 67) + '...' : task.description,
          task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja',
          new Date(task.created_at).toLocaleDateString('es-ES'),
          task.creator_name
        ]);
        
        doc.autoTable({
          startY: yPos,
          head: [['Título', 'Descripción', 'Prioridad', 'Fecha de Creación', 'Creador']],
          body: reviewTasksData,
          theme: 'grid',
          headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] },
          margin: { left: 14 },
          styles: { fontSize: 9, cellPadding: 3, overflow: 'ellipsize' },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' }
          }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
      }
      
      // SECCIÓN DE TAREAS COMPLETADAS
      if (completedTasks.length > 0) {
        // Si estamos cerca del final de la página, añadir una nueva
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(33, 33, 33);
        doc.text('Tareas Completadas', 14, yPos);
        yPos += 10;
        
        const completedTasksData = completedTasks.map(task => [
          task.title,
          task.description.length > 70 ? task.description.substring(0, 67) + '...' : task.description,
          task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja',
          new Date(task.created_at).toLocaleDateString('es-ES'),
          task.creator_name
        ]);
        
        doc.autoTable({
          startY: yPos,
          head: [['Título', 'Descripción', 'Prioridad', 'Fecha de Creación', 'Creador']],
          body: completedTasksData,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
          margin: { left: 14 },
          styles: { fontSize: 9, cellPadding: 3, overflow: 'ellipsize' },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' }
          }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
      }
      
    } else {
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('No hay tareas asignadas a este usuario', 14, yPos);
    }
    
    // Convertir el PDF a ArrayBuffer
    const pdfBytes = doc.output('arraybuffer');
    
    // Devolver el PDF como respuesta
    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-detallado-${user.username}.pdf"`,
      },
    });
    
  } catch (error) {
    console.error('Error al generar reporte:', error);
    return NextResponse.json(
      { error: 'Error al generar reporte: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}