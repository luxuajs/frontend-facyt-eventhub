import React, { useState } from 'react';
import { Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { safeParseJson } from '../utils/api';

export default function VerifyCode({ email, onNavigate }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!code || code.trim().length !== 6) {
      setError('El código de verificación debe tener exactamente 6 dígitos.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: code.trim() }),
      });

      const data = await safeParseJson(res, 'Código incorrecto o expirado.');
      setMessage(data.message || 'Cuenta activada con éxito.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/resend-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await safeParseJson(res, 'Error al reenviar código.');
      setMessage(data.message || 'Nuevo código enviado a tu correo.');
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
          <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Verifica tu Correo
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Hemos enviado un código de 6 dígitos a <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>. Ingresa el código para activar tu cuenta.
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
              <label htmlFor="verification-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-center">
                Código de Confirmación
              </label>
              <input
                id="verification-code"
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[10px] font-mono text-2xl px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-200"
              />
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center"
              >
                {loading ? 'Verificando...' : 'Confirmar Código'}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="w-full text-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline py-1"
              >
                ¿No recibiste el código? Solicitar uno nuevo
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center mt-4">
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow-sm transition-all"
            >
              Iniciar Sesión
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
