import React, { useState, useEffect } from 'react';
import { CalendarRange, Sparkles, MapPin, Clock, Info, Check, X, ArrowRight, AlertCircle, Edit3, Megaphone, QrCode } from 'lucide-react';
import EditEventModal from './EditEventModal';
import PromoteEventModal from './PromoteEventModal';
import QRModal from './QRModal';

export default function ReservationsList({ token, user }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [editingEvento, setEditingEvento] = useState(null);
  const [promotingEvento, setPromotingEvento] = useState(null);
  const [qrModalEvento, setQrModalEvento] = useState(null);

  const fetchReservas = () => {
    fetch('/api/eventos/mis-eventos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReservas(data);
      })
      .catch(err => console.error('Error al cargar mis reservas:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservas();
  }, [token]);

  const handleResponderPropuesta = async (id, aceptar) => {
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch(`/api/eventos/${id}/responder-propuesta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ aceptar })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al responder a la propuesta.');

      setActionSuccess(data.message);
      fetchReservas();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { ...options, timeZone: 'UTC' });
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'APROBADO':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PENDIENTE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'PROPUESTA_CAMBIO':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30 animate-pulse';
      case 'RECHAZADO':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'CANCELADO':
        return 'bg-slate-700/10 text-slate-400 border-slate-700/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CalendarRange className="h-6 w-6 text-blue-500" />
          Mis Solicitudes de Reserva
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Consulta el estado, respuestas de coordinación y sugerencias de reasignación
        </p>
      </div>

      {actionError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-2 text-sm">
          <Check className="h-5 w-5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Cargando solicitudes...
        </div>
      ) : reservas.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          Aún no has enviado ninguna solicitud de reserva.
        </div>
      ) : (
        <div className="space-y-4">
          {reservas.map((reserva) => (
            <div
              key={reserva.id}
              className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md rounded-xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col gap-4"
            >
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Event Main Details */}
                <div className="space-y-2 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-md font-bold text-slate-900 dark:text-slate-100">{reserva.titulo}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(reserva.estado)}`}>
                      {reserva.estado === 'PROPUESTA_CAMBIO' ? 'PROPUESTA DE REASIGNACIÓN' : reserva.estado}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      ID: {reserva.id.slice(0, 8)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">{reserva.descripcion || 'Sin descripción.'}</p>

                  <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-blue-500" />
                      <span>{reserva.espacio.nombre}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="font-mono">{formatDate(reserva.fecha)} ({reserva.horaInicio} - {reserva.horaFin})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 text-slate-400" />
                      <span>Asistentes: {reserva.asistentesEstimados}</span>
                    </div>
                  </div>
                </div>

                {/* Display priority badge and edit action on the right */}
                <div className="shrink-0 flex items-center md:justify-end gap-2">
                  <span className="text-xs font-mono px-3 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                    Prioridad: {reserva.prioridad}
                  </span>

                  {reserva.estado === 'APROBADO' && user && (user.rol === 'ROOT' || user.rol === 'COORDINADOR' || (user.rol === 'SOLICITANTE' && (reserva.usuarioId === user.id || (reserva.usuario && reserva.usuario.id === user.id)))) && (
                    <button
                      type="button"
                      onClick={() => setPromotingEvento(reserva)}
                      className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Megaphone className="h-3.5 w-3.5" />
                      Promocionar Evento
                    </button>
                  )}

                  {['PENDIENTE', 'PROPUESTA_CAMBIO', 'RECHAZADO'].includes(reserva.estado) && (
                    <button
                      type="button"
                      onClick={() => setEditingEvento(reserva)}
                      className="px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Editar
                    </button>
                  )}
                </div>
              </div>

              {/* PROPUESTA DE CAMBIO CARD & ACTION BUTTONS */}
              {reserva.estado === 'PROPUESTA_CAMBIO' && (
                <div className="mt-2 p-4 md:p-5 bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-400/80 rounded-xl space-y-4 shadow-lg">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm tracking-wide">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Propuesta de Reasignación de Espacio
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 font-bold block mb-1">Original</span>
                      <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> <span className="line-through">{reserva.espacio.nombre}</span></div>
                      <div className="flex items-center gap-2"><CalendarRange className="h-3.5 w-3.5" /> <span className="line-through">{formatDate(reserva.fecha)}</span></div>
                      <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> <span className="line-through">{reserva.horaInicio} - {reserva.horaFin}</span></div>
                    </div>

                    <div className="space-y-2 p-3 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
                      <span className="text-amber-700 dark:text-amber-400 font-bold block mb-1">Sugerido</span>
                      <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400"><MapPin className="h-3.5 w-3.5" /> <span>{reserva.espacioSugerido?.nombre || 'Espacio Alternativo'}</span></div>
                      <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200"><CalendarRange className="h-3.5 w-3.5" /> <span>{reserva.fechaSugerida ? formatDate(reserva.fechaSugerida) : formatDate(reserva.fecha)}</span></div>
                      <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200"><Clock className="h-3.5 w-3.5" /> <span>{reserva.horaInicioSugerida || reserva.horaInicio} - {reserva.horaFinSugerida || reserva.horaFin}</span></div>
                    </div>
                  </div>

                  {reserva.motivoPropuesta && (
                    <div className="text-xs text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-amber-200 dark:border-amber-800/50 shadow-inner">
                      <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">Motivo del cambio:</span>
                      <span>
                        {reserva.motivoPropuesta.replace(/^Sugerencia de IA \(fallback\):\s*/i, '').replace(/^Sugerencia de IA:\s*/i, '').replace(/^\(fallback\):\s*/i, '')}
                      </span>
                    </div>
                  )}

                  {reserva.sugerenciaIA && (
                    <div className="text-xs text-indigo-900 dark:text-indigo-200 bg-indigo-50/80 dark:bg-indigo-950/40 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800/50 shadow-inner">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="font-bold text-indigo-700 dark:text-indigo-300">Recomendación de Asignación:</span>
                      </div>
                      <span>
                        {reserva.sugerenciaIA.replace(/^Sugerencia de IA \(fallback\):\s*/i, '').replace(/^Sugerencia de IA:\s*/i, '').replace(/^\(fallback\):\s*/i, '')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleResponderPropuesta(reserva.id, false)}
                      className="px-4 py-2 bg-slate-900 hover:bg-rose-950 text-slate-200 hover:text-rose-200 border border-slate-700 hover:border-rose-500 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <X className="h-4 w-4 text-rose-400" />
                      Rechazar Propuesta
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResponderPropuesta(reserva.id, true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-all duration-150 flex items-center gap-1.5 active:scale-95"
                    >
                      <Check className="h-4 w-4 stroke-[3]" />
                      Aceptar Cambio de Espacio (Aprobar Evento)
                    </button>
                  </div>
                </div>
              )}

              {/* Standard IA Suggestion / Reason in case of rejection */}
              {reserva.estado !== 'PROPUESTA_CAMBIO' && reserva.sugerenciaIA && (
                <div className="p-3 bg-rose-500/10 dark:bg-rose-950/60 border border-rose-500/40 text-rose-900 dark:text-rose-200 rounded-lg flex items-start space-x-2 text-xs">
                  <Sparkles className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <p className="font-bold text-rose-900 dark:text-rose-300">Detalles / Comentario del Coordinador:</p>
                    <p className="mt-0.5 text-slate-800 dark:text-slate-200">
                      {reserva.sugerenciaIA.replace(/^Sugerencia de IA \(fallback\):\s*/i, '').replace(/^Sugerencia de IA:\s*/i, '').replace(/^\(fallback\):\s*/i, '')}
                    </p>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Modal para editar evento */}
      {editingEvento && (
        <EditEventModal
          token={token}
          evento={editingEvento}
          onClose={() => setEditingEvento(null)}
          onEventUpdated={() => {
            setActionSuccess('Evento actualizado y auditado exitosamente.');
            fetchReservas();
          }}
        />
      )}

      {/* Modal para promocionar evento */}
      {promotingEvento && (
        <PromoteEventModal
          token={token}
          evento={promotingEvento}
          onClose={() => setPromotingEvento(null)}
        />
      )}

    </div>
  );
}
