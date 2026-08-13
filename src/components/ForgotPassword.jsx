import React, { useState } from 'react';
import { Mail, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Por favor introduce tu correo electrónico.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la solicitud.');
      }

      setMessage(data.message || 'Se ha enviado el enlace de restablecimiento.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl transition-all duration-150">
        
        {/* Go Back */}
        <button
          onClick={() => onNavigate('login')}
          className="flex items-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al Login
        </button>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Introduce tu correo y te enviaremos un enlace para restablecer tu contraseña
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
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center"
              >
                {loading ? 'Procesando...' : 'Enviar Enlace'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center mt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-all"
            >
              {loading ? 'Reenviando...' : '¿No lo recibiste? Reenviar correo'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
