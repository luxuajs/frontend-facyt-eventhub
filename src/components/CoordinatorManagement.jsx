import React, { useState, useEffect } from 'react';
import { Mail, User, School, CheckCircle, AlertTriangle, Trash2, Key, ShieldAlert, X, Loader2, Layers, BookOpen } from 'lucide-react';
import AreaManagementModal from './AreaManagementModal';
import MateriaManagementModal from './MateriaManagementModal';

export default function CoordinatorManagement({ token }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [escuelaId, setEscuelaId] = useState('');
  const [escuelas, setEscuelas] = useState([]);
  const [coordinadores, setCoordinadores] = useState([]);
  const [loadingCoordinadores, setLoadingCoordinadores] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Modales de Áreas y Materias
  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [materiaModalOpen, setMateriaModalOpen] = useState(false);

  // Modal para confirmación de eliminación
  const [selectedCoord, setSelectedCoord] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const [requestingCode, setRequestingCode] = useState(false);
  const [deletingCoord, setDeletingCoord] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const fetchCoordinadores = async () => {
    try {
      setLoadingCoordinadores(true);
      const res = await fetch('/api/auth/coordinators', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoordinadores(data);
      }
    } catch (err) {
      console.error('Error al cargar coordinadores:', err);
    } finally {
      setLoadingCoordinadores(false);
    }
  };

  useEffect(() => {
    fetch('/api/eventos/escuelas')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEscuelas(data);
      })
      .catch(err => console.error('Error al cargar escuelas:', err));

    fetchCoordinadores();
  }, [token]);

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
      fetchCoordinadores();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal e iniciar solicitud de código
  const handleOpenDeleteModal = (coord) => {
    setSelectedCoord(coord);
    setConfirmCode('');
    setCodeRequested(false);
    setModalError('');
    setModalSuccess('');
    setModalOpen(true);
    handleRequestCode(coord.id);
  };

  // Solicitar código de confirmación por correo al ROOT
  const handleRequestCode = async (coordId) => {
    setRequestingCode(true);
    setModalError('');
    setModalSuccess('');
    try {
      const res = await fetch('/api/auth/request-delete-coordinator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ coordinadorId: coordId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar el código de verificación.');
      }

      setCodeRequested(true);
      setModalSuccess(data.message || 'Código de confirmación enviado a tu correo institucional.');
    } catch (err) {
      setModalError(err.message);
    } finally {
      setRequestingCode(false);
    }
  };

  // Confirmar eliminación enviando código
  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    if (!confirmCode.trim() || confirmCode.trim().length !== 6) {
      setModalError('Por favor ingresa un código válido de 6 dígitos.');
      return;
    }

    setDeletingCoord(true);
    setModalError('');
    setModalSuccess('');

    try {
      const res = await fetch('/api/auth/confirm-delete-coordinator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coordinadorId: selectedCoord.id,
          code: confirmCode.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar el coordinador.');
      }

      setSuccess(`Coordinador ${selectedCoord.nombre} eliminado con éxito.`);
      setModalOpen(false);
      setSelectedCoord(null);
      fetchCoordinadores();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setDeletingCoord(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Gestión Académica y Coordinación
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administrá las áreas académicas, el catálogo de materias y las invitaciones a coordinadores.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAreaModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            Gestionar Áreas
          </button>
          <button
            onClick={() => setMateriaModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            Catálogo de Materias
          </button>
          <button
            onClick={async () => {
              if (window.confirm('⚠️ ¿Estás seguro de que deseas reiniciar la base de datos a CERO? Se borrarán todos los eventos, asistencias, auditorías y usuarios (preservando sólo tu cuenta ROOT).')) {
                try {
                  setError('');
                  setSuccess('');
                  const res = await fetch('/api/auth/reset-database', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || 'Error al reiniciar la base de datos.');
                  setSuccess(data.message || 'Base de datos reiniciada con éxito.');
                  fetchCoordinadores();
                } catch (err) {
                  setError(err.message);
                }
              }
            }}
            className="px-3.5 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Reiniciar BD a Cero
          </button>
        </div>
      </div>

      {areaModalOpen && (
        <AreaManagementModal token={token} onClose={() => setAreaModalOpen(false)} />
      )}

      {materiaModalOpen && (
        <MateriaManagementModal token={token} onClose={() => setMateriaModalOpen(false)} />
      )}

      {/* Alerts principales */}
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

      {/* Grid de 2 columnas: Formulario a la izquierda, Lista a la derecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Form Container: Invitar Coordinador */}
        <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md rounded-xl shadow-lg space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
            Invitar Nuevo Coordinador
          </h3>

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
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{loading ? 'Enviando Invitación...' : 'Enviar Enlace de Invitación'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* List Container: Coordinadores Activos y Registrados */}
        <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md rounded-xl shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Coordinadores Registrados
            </h3>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
              {coordinadores.length}
            </span>
          </div>

          {loadingCoordinadores ? (
            <div className="flex items-center justify-center py-12 text-slate-400 space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Cargando coordinadores...</span>
            </div>
          ) : coordinadores.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No hay coordinadores registrados aún.
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {coordinadores.map((coord) => (
                <div
                  key={coord.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="space-y-1 pr-2 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {coord.nombre}
                      </p>
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md ${
                        coord.activo 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                      }`}>
                        {coord.activo ? 'Activo' : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center space-x-1">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{coord.email}</span>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                      <School className="h-3 w-3 shrink-0 text-blue-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {coord.escuela ? coord.escuela.nombre : 'Todas / General'}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenDeleteModal(coord)}
                    title="Eliminar Coordinador"
                    className="p-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación con Código por Correo */}
      {modalOpen && selectedCoord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5 relative">
            
            {/* Header del Modal */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="h-6 w-6 shrink-0" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Confirmar Eliminación
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Subtítulo e información del coordinador */}
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg text-sm text-slate-700 dark:text-slate-300">
              <p className="font-medium text-rose-800 dark:text-rose-300">
                ¿Estás seguro de que deseas eliminar este coordinador?
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Coordinador: <strong>{selectedCoord.nombre}</strong> ({selectedCoord.email})
              </p>
            </div>

            {/* Mensajes del Modal */}
            {modalError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400 rounded-lg flex items-start space-x-2 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-lg flex items-start space-x-2 text-xs">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {/* Formulario de Código de Confirmación */}
            <form onSubmit={handleConfirmDelete} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Código de Confirmación (6 dígitos enviados al correo ROOT) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-lg tracking-widest font-mono text-center text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  disabled={requestingCode}
                  onClick={() => handleRequestCode(selectedCoord.id)}
                  className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 flex items-center space-x-1"
                >
                  {requestingCode && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>{requestingCode ? 'Reenviando...' : 'Reenviar código por correo'}</span>
                </button>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={deletingCoord || confirmCode.length !== 6}
                  className="w-1/2 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/50 text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
                >
                  {deletingCoord && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{deletingCoord ? 'Eliminando...' : 'Confirmar Eliminación'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
