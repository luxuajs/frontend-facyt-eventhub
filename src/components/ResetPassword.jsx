import React, { useState } from 'react';
import { KeyRound, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ResetPassword({ token, onNavigate }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al restablecer la contraseña.');
      }

      setMessage(data.message || 'Contraseña restablecida con éxito.');
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Nueva Contraseña
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Define una contraseña segura para tu cuenta
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400 rounded-lg flex items-start space-x-2 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-lg flex items-start space-x-2 text-sm">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Form */}
        {!message ? (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
            
            {/* Password */}
            <div>
              <label htmlFor="reset-pass" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  id="reset-pass"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reset-pass-confirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  id="reset-pass-confirm"
                  type="password"
                  required
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center"
              >
                {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center mt-4">
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow-sm transition-all"
            >
              Ir al Iniciar Sesión
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
