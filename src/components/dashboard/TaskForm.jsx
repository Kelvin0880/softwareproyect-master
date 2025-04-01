'use client';

import { useState, useEffect } from 'react';

const PRIORITY_STYLES = {
  high: 'bg-red-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-green-500 text-white'
};

const PRIORITY_LABELS = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja'
};

export default function TaskForm({ task, onSuccess, onCancel }) {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    fetchUsers();

    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        assigned_to: task.assigned_to,
        priority: task.priority,
        status: task.status
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = task ? `/api/tasks/${task.id}` : '/api/tasks';
      const method = task ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-900">
            Título
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            value={formData.title}
            onChange={handleChange}
            placeholder="Título de la tarea"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe la tarea..."
          />
        </div>

        <div>
          <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-900">
            Asignar a
          </label>
          <select
            id="assigned_to"
            name="assigned_to"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            value={formData.assigned_to}
            onChange={handleChange}
          >
            <option value="">Seleccionar usuario</option>
            {users.map(user => (
              <option key={user.id} value={user.id} className="text-gray-900">
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-900">
            Prioridad
          </label>
          <select
            id="priority"
            name="priority"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low" className="text-gray-900">Baja</option>
            <option value="medium" className="text-gray-900">Media</option>
            <option value="high" className="text-gray-900">Alta</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-900">
            Estado
          </label>
          <select
            id="status"
            name="status"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="pending" className="text-gray-900">Pendiente</option>
            <option value="in_progress" className="text-gray-900">En Progreso</option>
            <option value="review" className="text-gray-900">En Revisión</option>
            <option value="completed" className="text-gray-900">Completado</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : task ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}