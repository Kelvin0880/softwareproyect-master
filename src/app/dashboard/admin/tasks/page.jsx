'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import TaskForm from '@/components/dashboard/TaskForm';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import TaskDetailModal from '@/components/dashboard/TaskDetailModal'; 

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToView, setTaskToView] = useState(null);

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

  const handleEdit = (task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      await fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTaskMove = async (taskId, newStatus, updatedTasks) => {
    setTasks(updatedTasks); 
    try {
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
      }

      await fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewDetails = (task) => {
    setTaskToView(task); 
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Tareas</h1>
          <p className="text-gray-600 mt-1">Administra y organiza las tareas del equipo</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Crear Tarea
        </button>
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
        isAdmin={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails} 
      />

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl relative">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedTask(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <TaskForm 
                task={selectedTask}
                onSuccess={() => {
                  setShowForm(false);
                  setSelectedTask(null);
                  fetchTasks();
                }}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedTask(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {taskToView && (
        <TaskDetailModal 
          task={taskToView} 
          onClose={() => setTaskToView(null)} 
        />
      )}
    </div>
  );
}