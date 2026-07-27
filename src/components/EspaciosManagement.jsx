import React, { useState, useEffect } from 'react';
import ModalAlert from './ModalAlert';
import MateriaAssignmentModal from './MateriaAssignmentModal';
import { BookOpen } from 'lucide-react';

export default function EspaciosManagement({ user, token }) {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal para ingresar motivo de mantenimiento/inhabilitación
  const [selectedEspacio, setSelectedEspacio] = useState(null);
  const [targetEstado, setTargetEstado] = useState('');
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [duracionTipo, setDuracionTipo] = useState('INDETERMINADO');
  const [cantidadDias, setCantidadDias] = useState(1);

  // Modal para asignación de materias
  const [selectedEspacioParaMaterias, setSelectedEspacioParaMaterias] = useState(null);

  useEffect(() => {
    fetchEspacios();
  }, []);

  const fetchEspacios = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/espacios');
      if (!res.ok) throw new Error('Error al obtener la lista de espacios.');
      const data = await res.json();
      setEspacios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (espacio, estado) => {
    setSelectedEspacio(espacio);
    setTargetEstado(estado);
    setMotivo('');
    setError('');
    setDuracionTipo('INDETERMINADO');
    setCantidadDias(1);
  };

  const handleCloseModal = () => {
    setSelectedEspacio(null);
    setTargetEstado('');
    setMotivo('');
  };

  const handleConfirmStateChange = async (e) => {
    e.preventDefault();
    if (!selectedEspacio || !targetEstado) return;

    if (['MANTENIMIENTO', 'INHABILITADO'].includes(targetEstado) && !motivo.trim()) {
      setError('Debes especificar la causa o motivo del mantenimiento/inhabilitación.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccessMsg('');

      const res = await fetch(`/api/espacios/${selectedEspacio.id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          estado: targetEstado,
          motivo: motivo.trim(),
          ...(targetEstado === 'INHABILITADO' && { 
            duracionTipo, 
            cantidadDias: cantidadDias === '' ? 1 : parseInt(cantidadDias, 10) 
          })
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar el estado del espacio.');
      }

      let msg = data.message;
      if (data.eventosCanceladosCount > 0) {
        msg += ` Se cancelaron y notificaron por correo ${data.eventosCanceladosCount} reserva(s) afectada(s).`;
      }

      setSuccessMsg(msg);
      handleCloseModal();
      fetchEspacios();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirectActivar = async (espacio) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const res = await fetch(`/api/espacios/${espacio.id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          estado: 'ACTIVO',
          motivo: 'Espacio reactivado por el coordinador.'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al activar espacio.');

      setSuccessMsg(`El espacio "${espacio.nombre}" ahora está ACTIVO y disponible para reservas.`);
      fetchEspacios();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && espacios.length === 0) {
    return (
      <div className="flex justify-center items-center p-12 text-slate-500">
        <svg className="animate-spin h-6 w-6 mr-3 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span>Cargando infraestructura de espacios...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Gestión de Espacios e Infraestructura
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Administra la operatividad de salones, auditorios y laboratorios. Vincula materias asignadas o inhabilita espacios ante eventualidades.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
          Rol: {user.rol}
        </span>
      </div>

      <ModalAlert
        isOpen={Boolean(error)}
        onClose={() => setError('')}
        title="Atención"
        message={error}
        type="error"
      />

      <ModalAlert
        isOpen={Boolean(successMsg)}
        onClose={() => setSuccessMsg('')}
        title="Operación Exitosa"
        message={successMsg}
        type="success"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {espacios.map((esp) => {
          const isActivo = esp.estado === 'ACTIVO';
          const isMantenimiento = esp.estado === 'MANTENIMIENTO';
          const esLaboratorio = esp.nombre.toLowerCase().includes('laboratorio') || esp.tipo.toLowerCase().includes('laboratorio');

          return (
            <div
              key={esp.id}
              className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between ${
                isActivo
                  ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  : isMantenimiento
                  ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-rose-300 dark:border-rose-700/60 bg-rose-50/20 dark:bg-rose-950/10'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {esp.nombre}
                  </h3>
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      isActivo
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : isMantenimiento
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                    }`}
                  >
                    {esp.estado}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 mb-3">
                  <p><strong>Tipo:</strong> {esp.tipo.replace('_', ' ')}</p>
                  <p><strong>Capacidad:</strong> {esp.capacidad} estudiantes</p>
                  <p><strong>Horario:</strong> {esp.horaApertura} - {esp.horaCierre}</p>
                  <p><strong>Días:</strong> {esp.diasPermitidos}</p>
                  {esp.escuela && (
                    <p><strong>Escuela:</strong> <span className="text-blue-600 dark:text-blue-400 font-medium">{esp.escuela.nombre}</span></p>
                  )}
                </div>

                {/* Materias Asignadas */}
                {esLaboratorio && esp.materias && esp.materias.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-xs text-slate-700 dark:text-slate-300 mb-1.5">Materias Asignadas:</p>
                    <div className="flex flex-wrap gap-1">
                      {esp.materias.map((m) => (
                        <span
                          key={m.id}
                          className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] rounded-md font-mono border border-blue-500/20"
                        >
                          {m.codigo ? `${m.codigo} - ${m.nombre}` : m.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                {esLaboratorio && (
                  <button
                    onClick={() => setSelectedEspacioParaMaterias(esp)}
                    className="w-full py-1.5 px-3 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 mb-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    Asignar Materias
                  </button>
                )}

                {!isActivo && (
                  <button
                    onClick={() => handleDirectActivar(esp)}
                    className="flex-1 py-1.5 px-3 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    Activar Espacio
                  </button>
                )}

                {isActivo && (
                  <>
                    <button
                      onClick={() => handleOpenModal(esp, 'MANTENIMIENTO')}
                      className="flex-1 py-1.5 px-3 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                    >
                      Mantenimiento
                    </button>
                    <button
                      onClick={() => handleOpenModal(esp, 'INHABILITADO')}
                      className="flex-1 py-1.5 px-3 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
                    >
                      Inhabilitar
                    </button>
                  </>
                )}

                {isMantenimiento && (
                  <button
                    onClick={() => handleOpenModal(esp, 'INHABILITADO')}
                    className="py-1.5 px-3 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
                  >
                    Inhabilitar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Asignación de Materias */}
      {selectedEspacioParaMaterias && (
        <MateriaAssignmentModal
          espacio={selectedEspacioParaMaterias}
          token={token}
          onClose={() => setSelectedEspacioParaMaterias(null)}
          onUpdated={fetchEspacios}
        />
      )}

      {/* Modal de confirmación de Mantenimiento / Inhabilitación */}
      {selectedEspacio && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Cambiar estado de {selectedEspacio.nombre}
            </h3>

            <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-3 rounded text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold">⚠️ Contingencia de Reservas Aprobadas / Pendientes:</p>
              <p>
                Al cambiar el estado a <strong>{targetEstado}</strong>, cualquier reserva activa programada para este espacio será <strong>CANCELADA AUTOMÁTICAMENTE</strong> y se enviará un correo electrónico de notificación a los solicitantes afectados.
              </p>
            </div>

            <form onSubmit={handleConfirmStateChange} className="space-y-4">
              {targetEstado === 'INHABILITADO' && (
                <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Duración de la Inhabilitación
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input 
                        type="radio" 
                        name="duracionTipo" 
                        value="INDETERMINADO" 
                        checked={duracionTipo === 'INDETERMINADO'}
                        onChange={(e) => setDuracionTipo(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                      />
                      Indeterminado
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input 
                        type="radio" 
                        name="duracionTipo" 
                        value="DIAS" 
                        checked={duracionTipo === 'DIAS'}
                        onChange={(e) => setDuracionTipo(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                      />
                      Por cantidad de días
                    </label>
                  </div>
                  {duracionTipo === 'DIAS' && (
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Cantidad de días
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={cantidadDias}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCantidadDias(val === '' ? '' : (parseInt(val, 10) || 1));
                        }}
                        className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Motivo de Mantenimiento / Inhabilitación *
                </label>
                <textarea
                  rows={3}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej: Mantenimiento correctivo de proyectores y aire acondicionado, reparaciones eléctricas en laboratorio..."
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm ${
                    targetEstado === 'MANTENIMIENTO'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submitting ? 'Procesando...' : `Confirmar ${targetEstado}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
