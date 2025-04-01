'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, Eye, X } from 'lucide-react';
import Pagination from '@/components/dashboard/Pagination';
import TaskDetailModal from '@/components/dashboard/TaskDetailModal';
import GlobalReportButton from '@/components/dashboard/GlobalReportButton';

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    efficiency: 0
  });
  const [pagination, setPagination] = useState({
    tasks: {
      page: 1,
      perPage: 5
    },
    users: {
      page: 1,
      perPage: 5
    }
  });

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes, userDataRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/users'),
        fetch('/api/auth/me')
      ]);

      const tasksData = await tasksRes.json();
      const usersData = await usersRes.json();
      const userData = await userDataRes.json();

      setTasks(tasksData.tasks);
      setUsers(usersData.users);
      setUserRole(userData.role);

      // Calcular estadísticas
      const totalTasks = tasksData.tasks.length;
      const completedTasks = tasksData.tasks.filter(task => task.status === 'completed').length;
      const efficiency = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      setStats({
        totalTasks,
        completedTasks,
        efficiency: Math.round(efficiency)
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const taskDate = new Date(task.created_at);
    const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const end = dateRange.endDate ? new Date(dateRange.endDate) : null;

    const matchesDate = (!start || taskDate >= start) && (!end || taskDate <= end);

    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        {/* Botón de Reporte Global - Solo visible para administradores */}
        {userRole === 'admin' && (
          <GlobalReportButton />
        )}
      </div>

      {/* Información General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total de Tareas</h3>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Tareas Completadas</h3>
          <p className="text-2xl font-semibold text-green-600">{stats.completedTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Eficiencia</h3>
          <p className="text-2xl font-semibold text-blue-600">{stats.efficiency}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Usuarios Activos</h3>
          <p className="text-2xl font-semibold text-purple-600">{users.length}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 rounded-lg border text-gray-700 focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar tareas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg border text-gray-700 focus:ring-2 focus:ring-blue-500 appearance-none"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                style={{ colorScheme: 'light' }}
              />
            </div>
            <div className="relative">
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg border text-gray-700 focus:ring-2 focus:ring-blue-500 appearance-none"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                style={{ colorScheme: 'light' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Tareas Recientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Resumen de Tareas Recientes</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empleado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarea
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridad
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(
                (pagination.tasks.page - 1) * pagination.tasks.perPage,
                pagination.tasks.page * pagination.tasks.perPage
              )
              .map(task => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(task.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.assignee_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                <div className="flex items-center space-x-2">
                  <span className="truncate max-w-xs">{task.title}</span>
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {task.status === 'completed' ? 'Completada' :
                       task.status === 'in_progress' ? 'En Progreso' :
                       task.status === 'review' ? 'En Revisión' :
                       'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'}`}>
                      {task.priority === 'high' ? 'Alta' :
                       task.priority === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <Pagination
          currentPage={pagination.tasks.page}
          totalItems={filteredTasks.length}
          perPage={pagination.tasks.perPage}
          onPageChange={(page) => setPagination(prev => ({
            ...prev,
            tasks: { ...prev.tasks, page }
          }))}
        />
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200 my-8"></div>

      {/* Reporte de Usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Reporte de Usuarios</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tareas Asignadas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tareas Completadas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users
              .slice(
                (pagination.users.page - 1) * pagination.users.perPage,
                pagination.users.page * pagination.users.perPage
              )
              .map(user => {
                const userTasks = tasks.filter(task => task.assigned_to === user.id);
                const completedTasks = userTasks.filter(task => task.status === 'completed');

                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.id.slice(0, 3)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role === 'admin' ? 'Supervisor' : 'Empleado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userTasks.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {completedTasks.length}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <Pagination
          currentPage={pagination.users.page}
          totalItems={users.length}
          perPage={pagination.users.perPage}
          onPageChange={(page) => setPagination(prev => ({
            ...prev,
            users: { ...prev.users, page }
          }))}
        />
      </div>

      {/* Modal de Detalles de Tarea */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
}