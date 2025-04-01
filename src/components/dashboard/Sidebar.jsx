'use client';

import { Home, Users, Settings, LogOut, BarChart, ListTodo, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU_ITEMS = {
    general: [
      { href: '/dashboard', icon: Home, label: 'Inicio' },
      { href: '/dashboard/tasks', icon: ListTodo, label: 'Tareas' },
      { href: '/dashboard/users', icon: Users, label: 'Usuarios' },  
      // { href: '/dashboard/settings', icon: Settings, label: 'Configuración' },
    ],
    admin: [
      { href: '/dashboard/admin/users', icon: Users, label: 'Gestión de Usuarios' },
      { href: '/dashboard/admin/tasks', icon: ClipboardList, label: 'Gestión de Tareas' }
    ]
  };
export default function Sidebar({ isOpen, userRole }) {
  const pathname = usePathname();

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    window.location.href = '/login';
  };

  return (
    <aside 
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-white shadow-lg transition-all duration-300 flex flex-col h-screen`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
          <h2 className={`font-bold text-gray-900 ${isOpen ? 'text-xl' : 'text-center w-full'}`}>
            {isOpen ? 'Dashboard' : 'D'}
          </h2>
        </div>

        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-3 space-y-8">
            {/* Sección General */}
            <div>
              {isOpen && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  General
                </h3>
              )}
              <div className="mt-2 space-y-1">
                {MENU_ITEMS.general.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sección Admin */}
            {userRole === 'admin' && (
              <div>
                {isOpen && (
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </h3>
                )}
                <div className="mt-2 space-y-1">
                  {MENU_ITEMS.admin.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${
                        pathname === item.href
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                    >
                      <item.icon
                        className={`${
                          pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 flex-shrink-0 h-6 w-6`}
                      />
                      {isOpen && <span>{item.label}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>

        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
          >
            <LogOut className="mr-3 h-6 w-6" />
            {isOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}