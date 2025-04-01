// /app/api/reports/global/route.js
import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
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
    
    connection = await createConnection();
    
    // Obtener datos de usuarios
    const [users] = await connection.execute(
      'SELECT id, username, email, name, role, created_at FROM users'
    );
    
    // Obtener datos de tareas
    const [tasks] = await connection.execute(
      `SELECT 
        t.*,
        c.name as creator_name,
        a.name as assignee_name
      FROM tasks t
      JOIN users c ON t.created_by = c.id
      JOIN users a ON t.assigned_to = a.id
      ORDER BY t.status, t.priority DESC, t.created_at DESC`
    );
    
    // Generar el PDF
    const doc = new jsPDF();
    let yPos = 20;
    
    // Título del reporte
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);
    doc.text('Reporte General Detallado del Sistema', 14, yPos);
    yPos += 10;
    
    // Fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, 14, yPos);
    yPos += 15;
    
    // ---------- SECCIÓN DE RESUMEN DE USUARIOS ----------
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Resumen de Usuarios', 14, yPos);
    yPos += 10;
    
    // Contar usuarios por rol
    const adminCount = users.filter(user => user.role === 'admin').length;
    const employeeCount = users.filter(user => user.role === 'employee').length;
    
    const userData = [
      ['Total de Usuarios', users.length.toString()],
      ['Administradores', adminCount.toString()],
      ['Empleados', employeeCount.toString()]
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Categoría', 'Cantidad']],
      body: userData,
      theme: 'grid',
      headStyles: { fillColor: [41, 98, 255], textColor: [255, 255, 255] },
      margin: { left: 14 },
      styles: { fontSize: 10 },
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Lista de usuarios
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.text('Lista de Usuarios', 14, yPos);
    yPos += 8;
    
    const usersTableData = users.map(user => [
      user.name,
      user.username,
      user.email,
      user.role === 'admin' ? 'Administrador' : 'Empleado',
      new Date(user.created_at).toLocaleDateString('es-ES')
    ]);
    
    doc.autoTable({
      startY: yPos,
      head: [['Nombre', 'Usuario', 'Email', 'Rol', 'Fecha de Registro']],
      body: usersTableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 98, 255], textColor: [255, 255, 255] },
      margin: { left: 14 },
      styles: { fontSize: 9, cellPadding: 3 },
    });
    
    // ---------- SECCIÓN DE RESUMEN DE TAREAS ----------
    // Nueva página para el resumen de tareas
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Resumen de Tareas', 14, yPos);
    yPos += 10;
    
    // Contar tareas por estado
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
    const reviewTasks = tasks.filter(task => task.status === 'review');
    const completedTasks = tasks.filter(task => task.status === 'completed');
    
    // Contar tareas por prioridad
    const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
    const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
    const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
    
    const taskStatusData = [
      ['Total de Tareas', tasks.length.toString()],
      ['Pendientes', pendingTasks.length.toString()],
      ['En Progreso', inProgressTasks.length.toString()],
      ['En Revisión', reviewTasks.length.toString()],
      ['Completadas', completedTasks.length.toString()]
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Estado', 'Cantidad']],
      body: taskStatusData,
      theme: 'grid',
      headStyles: { fillColor: [41, 98, 255], textColor: [255, 255, 255] },
      margin: { left: 14 },
      styles: { fontSize: 10 },
    });
    
    yPos = doc.lastAutoTable.finalY + 10;
    
    const taskPriorityData = [
      ['Prioridad Alta', highPriorityTasks.toString()],
      ['Prioridad Media', mediumPriorityTasks.toString()],
      ['Prioridad Baja', lowPriorityTasks.toString()]
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Prioridad', 'Cantidad']],
      body: taskPriorityData,
      theme: 'grid',
      headStyles: { fillColor: [41, 98, 255], textColor: [255, 255, 255] },
      margin: { left: 14 },
      styles: { fontSize: 10 },
    });
    
    // ---------- SECCIÓN DE TAREAS PENDIENTES ----------
    if (pendingTasks.length > 0) {
      doc.addPage();
      yPos = 20;
      
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Tareas Pendientes', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Total: ${pendingTasks.length} tareas`, 14, yPos);
      yPos += 8;
      
      const pendingTasksData = pendingTasks.map(task => [
        task.title,
        task.description.length > 65 ? task.description.substring(0, 62) + '...' : task.description,
        task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja',
        task.assignee_name,
        new Date(task.created_at).toLocaleDateString('es-ES')
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Título', 'Descripción', 'Prioridad', 'Asignado a', 'Fecha de Creación']],
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
    }
    
    // ---------- SECCIÓN DE TAREAS EN PROGRESO ----------
    if (inProgressTasks.length > 0) {
      doc.addPage();
      yPos = 20;
      
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Tareas En Progreso', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Total: ${inProgressTasks.length} tareas`, 14, yPos);
      yPos += 8;
      
      const inProgressTasksData = inProgressTasks.map(task => [
        task.title,
        task.description.length > 65 ? task.description.substring(0, 62) + '...' : task.description,
        task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja',
        task.assignee_name,
        new Date(task.created_at).toLocaleDateString('es-ES')
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Título', 'Descripción', 'Prioridad', 'Asignado a', 'Fecha de Creación']],
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
    }
    
    // ---------- SECCIÓN DE TAREAS EN REVISIÓN ----------
    if (reviewTasks.length > 0) {
      doc.addPage();
      yPos = 20;
      
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Tareas En Revisión', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Total: ${reviewTasks.length} tareas`, 14, yPos);
      yPos += 8;
      
      const reviewTasksData = reviewTasks.map(task => [
        task.title,
        task.description.length > 65 ? task.description.substring(0, 62) + '...' : task.description,
        task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja',
        task.assignee_name,
        new Date(task.created_at).toLocaleDateString('es-ES')
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Título', 'Descripción', 'Prioridad', 'Asignado a', 'Fecha de Creación']],
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
    }
    
    // ---------- SECCIÓN DE TAREAS COMPLETADAS ----------
    if (completedTasks.length > 0) {
      doc.addPage();
      yPos = 20;
      
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Tareas Completadas', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Total: ${completedTasks.length} tareas`, 14, yPos);
      yPos += 8;
      
      const completedTasksData = completedTasks.map(task => [
        task.title,
        task.description.length > 65 ? task.description.substring(0, 62) + '...' : task.description,
        task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja',
        task.assignee_name,
        new Date(task.created_at).toLocaleDateString('es-ES')
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Título', 'Descripción', 'Prioridad', 'Asignado a', 'Fecha de Creación']],
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
    }
    
    // ---------- SECCIÓN DE MÉTRICAS DE RENDIMIENTO ----------
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(16);
    doc.setTextColor(33, 33, 33);
    doc.text('Métricas de Rendimiento por Usuario', 14, yPos);
    yPos += 15;
    
    // Calcular métricas por usuario
    const employeeMetrics = [];
    
    users
      .filter(user => user.role === 'employee')
      .forEach(user => {
        const userTasks = tasks.filter(task => task.assigned_to === user.id);
        const completedUserTasks = userTasks.filter(task => task.status === 'completed');
        const inProgressUserTasks = userTasks.filter(task => task.status === 'in_progress');
        const reviewUserTasks = userTasks.filter(task => task.status === 'review');
        const pendingUserTasks = userTasks.filter(task => task.status === 'pending');
        
        const completionRate = userTasks.length > 0
          ? Math.round((completedUserTasks.length / userTasks.length) * 100)
          : 0;
        
        if (userTasks.length > 0) {
          employeeMetrics.push([
            user.name,
            userTasks.length.toString(),
            completedUserTasks.length.toString(),
            pendingUserTasks.length.toString(),
            inProgressUserTasks.length.toString(),
            reviewUserTasks.length.toString(),
            `${completionRate}%`
          ]);
        }
      });
    
    if (employeeMetrics.length > 0) {
      doc.autoTable({
        startY: yPos,
        head: [
          ['Empleado', 'Tareas Totales', 'Completadas', 'Pendientes', 'En Progreso', 'En Revisión', 'Tasa de Completado']
        ],
        body: employeeMetrics,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
        margin: { left: 14 },
        styles: { fontSize: 10 },
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('No hay datos suficientes para generar métricas de rendimiento', 14, yPos);
    }
    
    // Convertir el PDF a ArrayBuffer
    const pdfBytes = doc.output('arraybuffer');
    
    // Devolver el PDF como respuesta
    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="reporte-global-detallado.pdf"',
      },
    });
    
  } catch (error) {
    console.error('Error al generar reporte global:', error);
    return NextResponse.json(
      { error: 'Error al generar reporte global: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}