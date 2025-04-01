'use client';

import { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setUserRole(data.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} userRole={userRole} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center flex-1">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none mr-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                {userRole && (
                  <span className="ml-3 text-sm text-gray-600">
                    {userRole === 'admin' ? 'Administrador' : 'Empleado'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}