import React, { useState, useEffect } from 'react';
import { User, Mail, KeyRound, School, AlertTriangle } from 'lucide-react';
import { safeParseJson } from '../utils/api';

export default function Register({ onRegisterSuccess, onNavigate }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('ESTUDIANTE');
  const [escuelaId, setEscuelaId] = useState('');
  const [escuelas, setEscuelas] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar las escuelas
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

    // Validaciones nativas
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.querySelectorAll('input, select').forEach(el => {
        if (!el.checkValidity()) {
          el.setAttribute('aria-invalid', 'true');
        }
      });
      setError('Por favor corrige los campos con errores.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          email,
          password,
          tipoUsuario,
          escuelaId: escuelaId || null,
        }),
      });

      const data = await safeParseJson(res, 'Error en el registro.');
      onRegisterSuccess(email);
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
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Regístrate para solicitar espacios y eventos en FaCyT
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
        <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
          
          {/* Nombre */}
          <div>
            <label htmlFor="reg-nombre" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nombre Completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                id="reg-nombre"
                name="nombre"
                type="text"
                required
                placeholder="Juan Pérez"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
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
                ❌ El nombre es requerido.
              </span>
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Correo Institucional
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                placeholder="jperez@gmail.com"
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

          {/* Contraseña */}
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                id="reg-password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
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
                ❌ La contraseña debe tener al menos 6 caracteres.
              </span>
            </div>
          </div>

          {/* Tipo de Usuario */}
          <div>
            <label htmlFor="reg-tipo-usuario" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tipo de Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <select
                id="reg-tipo-usuario"
                name="tipoUsuario"
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
              >
                <option value="ESTUDIANTE">Estudiante</option>
                <option value="PROFESOR">Profesor</option>
                <option value="COORDINADOR">Coordinador</option>
                <option value="GRUPO_EXTERNO">Grupo Externo</option>
              </select>
            </div>
          </div>

          {/* Escuela */}
          <div>
            <label htmlFor="reg-escuela" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Escuela de Adscripción
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <School className="h-4 w-4" />
              </div>
              <select
                id="reg-escuela"
                name="escuelaId"
                value={escuelaId}
                onChange={(e) => setEscuelaId(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              >
                <option value="">Ninguna / Público General</option>
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
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
