import React, { useState, useEffect } from 'react';
import { Mail, User, School, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CoordinatorManagement({ token }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [escuelaId, setEscuelaId] = useState('');
  const [escuelas, setEscuelas] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/eventos/escuelas')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEscuelas(data);
      })
      .catch(err => console.error('Error al cargar escuelas:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.querySelectorAll('input').forEach(el => {
        if (!el.checkValidity()) el.setAttribute('aria-invalid', 'true');
      });
      setError('Por favor completa todos los campos requeridos correctamente.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/invite-coordinator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre,
          email,
          escuelaId: escuelaId || null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar invitación.');
      }

      setSuccess(data.message || 'Invitación enviada con éxito.');
      setNombre('');
      setEmail('');
      setEscuelaId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Gestión de Coordinadores
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Invita a nuevos coordinadores para gestionar los espacios físicos y las colas de asignación
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400 rounded-lg flex items-start space-x-2 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-lg flex items-start space-x-2 text-sm">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          
          {/* Nombre */}
          <div>
            <label htmlFor="inv-nombre" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nombre Completo *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                id="inv-nombre"
                type="text"
                required
                placeholder="Nombre del Coordinador"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  e.target.removeAttribute('aria-invalid');
                }}
                onBlur={(e) => {
                  if (!e.target.checkValidity()) e.target.setAttribute('aria-invalid', 'true');
                }}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="inv-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Correo Institucional *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="inv-email"
                type="email"
                required
                placeholder="coordinador@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  e.target.removeAttribute('aria-invalid');
                }}
                onBlur={(e) => {
                  if (!e.target.checkValidity()) e.target.setAttribute('aria-invalid', 'true');
                }}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Escuela */}
          <div>
            <label htmlFor="inv-escuela" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Escuela a Cargo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <School className="h-4 w-4" />
              </div>
              <select
                id="inv-escuela"
                value={escuelaId}
                onChange={(e) => setEscuelaId(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Todas / Sin Exclusividad Directa</option>
                {escuelas.map((esc) => (
                  <option key={esc.id} value={esc.id}>
                    {esc.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center"
            >
              {loading ? 'Enviando Invitación...' : 'Enviar Enlace de Invitación'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
