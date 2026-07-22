import React, { useState } from 'react';
import { KeyRound, Mail, AlertTriangle } from 'lucide-react';
import { safeParseJson } from '../utils/api';

export default function Login({ onLoginSuccess, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await safeParseJson(res, 'Error al iniciar sesión.');
      onLoginSuccess(data.token, data.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl transition-all duration-150">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
            F
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Ingresa a tu cuenta de FaCyT EventHub
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400 rounded-lg flex items-start space-x-2 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            
            {/* Email Input */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="ejemplo@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    e.target.removeAttribute('aria-invalid');
                  }}
                  onBlur={(e) => {
                    if (!e.target.checkValidity()) {
                      e.target.setAttribute('aria-invalid', 'true');
                    }
                  }}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
                <span className="hidden error-msg text-xs text-rose-500 mt-1 pl-1">
                  ❌ Introduce un correo válido.
                </span>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ¿La olvidaste?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    e.target.removeAttribute('aria-invalid');
                  }}
                  onBlur={(e) => {
                    if (!e.target.checkValidity()) {
                      e.target.setAttribute('aria-invalid', 'true');
                    }
                  }}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
                <span className="hidden error-msg text-xs text-rose-500 mt-1 pl-1">
                  ❌ La contraseña es requerida.
                </span>
              </div>
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center"
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ¿No tienes una cuenta?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Regístrate aquí
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
