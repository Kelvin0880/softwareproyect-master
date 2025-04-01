'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function UserForm({ user, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    role: 'employee'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '', // No mostrar la contraseña actual
        name: user.name,
        role: user.role
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = user 
        ? `/api/users/${user.id}` 
        : '/api/users/create';

      const method = user ? 'PUT' : 'POST';
      
      // Si estamos editando y no se cambió la contraseña, no la enviamos
      const dataToSend = user && !formData.password 
        ? { ...formData, password: undefined }
        : formData;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar el usuario');
      }

      setSuccess(user ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm font-medium">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de Usuario
          </label>
          <input
            type="text"
            name="username"
            id="username"
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            value={formData.username}
            onChange={handleChange}
            placeholder="Ingrese nombre de usuario"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            value={formData.email}
            onChange={handleChange}
            placeholder="ejemplo@correo.com"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ingrese nombre completo"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Rol
          </label>
          <select
            name="role"
            id="role"
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="employee">Empleado</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {user ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              required={!user} // Solo requerido en creación
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              value={formData.password}
              onChange={handleChange}
              placeholder={user ? "••••••••" : "Nueva contraseña"}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Procesando...' : user ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}