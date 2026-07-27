import React, { useState, useEffect } from 'react';
import { X, Sparkles, Calendar, Clock, Users, Save, AlertCircle } from 'lucide-react';

export default function EditEventModal({ token, evento, onClose, onEventUpdated }) {
  if (!evento) return null;

  const [titulo, setTitulo] = useState(evento.titulo || '');
  const [descripcion, setDescripcion] = useState(evento.descripcion || '');
  const [tipo, setTipo] = useState(evento.tipo || 'Clase Teórica');
  const [asistentesEstimados, setAsistentesEstimados] = useState(evento.asistentesEstimados || '');
  const [espacioId, setEspacioId] = useState(evento.espacioId || '');
  
  // Format initial date YYYY-MM-DD
  const initialDateStr = evento.fecha ? new Date(evento.fecha).toISOString().split('T')[0] : '';
  const [fecha, setFecha] = useState(initialDateStr);
  const [horaInicio, setHoraInicio] = useState(evento.horaInicio || '');
  const [horaFin, setHoraFin] = useState(evento.horaFin || '');

  const [espacios, setEspacios] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [collisionInfo, setCollisionInfo] = useState(null);

  useEffect(() => {
    fetch('/api/eventos/espacios')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEspacios(data);
      })
      .catch(err => console.error('Error al cargar catálogo de espacios:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCollisionInfo(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/eventos/${evento.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo,
          descripcion,
          tipo,
          asistentesEstimados: parseInt(asistentesEstimados),
          espacioId,
          fecha,
          horaInicio,
          horaFin
        })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error(`Error al procesar la respuesta del servidor (Estado: ${res.status}). Por favor intente nuevamente.`);
      }

      if (res.status === 409) {
        setCollisionInfo({
          message: data.error,
          tipoConflicto: data.tipoConflicto || 'HORARIO',
          sugerenciaIA: data.sugerenciaIA,
          fechaPropuesta: data.fechaPropuesta,
          horaInicioPropuesta: data.horaInicioPropuesta,
          horaFinPropuesta: data.horaFinPropuesta,
          slotsDisponibles: data.slotsDisponibles || [],
          espacioSugeridoId: data.espacioSugeridoId,
          espacioSugeridoNombre: data.espacioSugeridoNombre,
          espaciosSugeridos: data.espaciosSugeridos || []
        });
        setError('Conflicto detectado. Puedes ajustar el horario o espacio sugerido.');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar el evento.');
      }

      if (onEventUpdated) onEventUpdated(data.evento);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const aplicarSugerenciaHorario = (slot) => {
    setFecha(slot.fecha);
    setHoraInicio(slot.horaInicio);
    setHoraFin(slot.horaFin);
    setCollisionInfo(null);
    setError('');
  };

  const aplicarSugerenciaEspacio = (nuevoEspacioId) => {
    setEspacioId(nuevoEspacioId);
    setCollisionInfo(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Editar Evento / Reserva
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Modifica los detalles del evento registrado. Quedará grabado en el registro de auditoría.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-start gap-2.5 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Collision & AI Suggestions Box */}
        {collisionInfo && (
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Asistente IA - Conflicto de {collisionInfo.tipoConflicto}
            </div>
            <p className="text-xs text-slate-300">{collisionInfo.sugerenciaIA}</p>

            {/* Alternativas de Horarios */}
            {collisionInfo.slotsDisponibles.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-medium text-slate-400">Bloques de horario sugeridos:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {collisionInfo.slotsDisponibles.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => aplicarSugerenciaHorario(slot)}
                      className="p-2 bg-slate-800 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-500/50 rounded-lg text-xs text-slate-200 text-left transition-all"
                    >
                      <div className="font-mono text-purple-300">{slot.fecha}</div>
                      <div className="text-[11px] text-slate-400">{slot.horaInicio} - {slot.horaFin}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Alternativas de Espacios */}
            {collisionInfo.espaciosSugeridos.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-medium text-slate-400">Espacios con suficiente capacidad disponibles:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {collisionInfo.espaciosSugeridos.map((esp) => (
                    <button
                      key={esp.id}
                      type="button"
                      onClick={() => aplicarSugerenciaEspacio(esp.id)}
                      className="p-2 bg-slate-800 hover:bg-emerald-900/40 border border-slate-700 hover:border-emerald-500/50 rounded-lg text-xs text-slate-200 text-left transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-emerald-300">{esp.nombre}</div>
                        <div className="text-[11px] text-slate-400">Capacidad: {esp.capacidad} personas</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded border border-emerald-800">Usar</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Título del Evento *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descripción / Observaciones
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              placeholder="Detalles sobre el evento o requerimientos especiales..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Evento *
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Clase Teórica">Clase Teórica</option>
                <option value="Clase de Laboratorio">Clase de Laboratorio</option>
                <option value="Defensa de tesis">Defensa de tesis</option>
                <option value="Jornada de Pasantias">Jornada de Pasantias</option>
                <option value="Taller / Charla / Conversatorio">Taller / Charla / Conversatorio</option>
                <option value="Reunión institucional">Reunión institucional</option>
                <option value="Actividad Estudiantil">Actividad Estudiantil</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                Asistentes Estimados *
              </label>
              <input
                type="number"
                min="1"
                required
                value={asistentesEstimados}
                onChange={(e) => setAsistentesEstimados(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Espacio Asignado *
            </label>
            <select
              value={espacioId}
              onChange={(e) => setEspacioId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {espacios.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre} ({esp.tipo}) - Capacidad: {esp.capacidad} - {esp.escuela?.nombre || 'General'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                Fecha *
              </label>
              <input
                type="date"
                required
                min={(() => {
                  const d = new Date();
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })()}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                Hora Inicio *
              </label>
              <input
                type="time"
                required
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                Hora Fin *
              </label>
              <input
                type="time"
                required
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Guardando Cambios...' : 'Guardar y Actualizar'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
