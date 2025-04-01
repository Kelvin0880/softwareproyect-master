'use client';

import { useState, useEffect } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import TaskDetailModal from '@/components/dashboard/TaskDetailModal';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setTasks(data.tasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskMove = async (taskId, newStatus) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      setTasks(updatedTasks);

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
        await fetchTasks(); 
      }
    } catch (err) {
      setError(err.message);
      await fetchTasks(); 
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
  };

  const handleEdit = (task) => {
    
    console.log('Edit not available for regular users');
  };

  const handleDelete = (taskId) => {
    
    console.log('Delete not available for regular users');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Tareas</h1>
        <p className="text-gray-600 mt-1">Arrastra las tarjetas para actualizar su estado</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <KanbanBoard 
        tasks={tasks}
        onTaskMove={handleTaskMove}
        isAdmin={false}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
}