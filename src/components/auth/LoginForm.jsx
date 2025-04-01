'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
      
      document.cookie = `token=${data.token}; path=/`;
      router.push('/dashboard');
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-[#2563EB]"></div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                required
                className="block w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="block w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-lg bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 disabled:opacity-70"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>
      </form>
    </div>
  );
}