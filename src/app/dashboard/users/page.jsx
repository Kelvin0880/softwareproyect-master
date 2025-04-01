'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import UserReportButton from '@/components/dashboard/UserReportButton';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setUserRole(data.role);
      } catch (error) {
        console.error('Error al obtener rol de usuario:', error);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, tasksRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/tasks')
        ]);
        
        const usersData = await usersRes.json();
        const tasksData = await tasksRes.json();
        
        setUsers(usersData.users);
        setTasks(tasksData.tasks);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Directorio de Usuarios</h1>
        <div className="relative w-full max-w-md">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 rounded-lg border text-gray-700 focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                  </span>
                </div>
              </div>
              {userRole === 'admin' && (
                <UserReportButton user={user} tasks={tasks} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}