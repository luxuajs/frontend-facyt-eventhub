import React, { useState, useEffect } from 'react';
import { Award, Check, X, MapPin, Clock, Users, User, AlertTriangle, AlertCircle, Sparkles, Send, Edit3 } from 'lucide-react';
import EditEventModal from './EditEventModal';

export default function CoordinatorQueue({ token }) {
  const [cola, setCola] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [justificacion, setJustificacion] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Estados para Análisis de IA y Propuesta de Cambio
  const [analyzingItem, setAnalyzingItem] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [proposalReason, setProposalReason] = useState('');

  const fetchCola = async () => {
    try {
      const res = await fetch('/api/coordinador/cola', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCola(data);
      }
    } catch (err) {
      console.error('Error al cargar la cola de coordinación:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCola();
  }, [token]);

  const handleApprove = async (id) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/eventos/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: 'APROBADO' })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al aprobar la reserva.');
      }

      setSuccess('Reserva aprobada con éxito.');
      fetchCola();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!justificacion.trim()) {
      setError('Debes especificar una justificación para el rechazo.');
      return;
    }

    setError('');
    setSuccess('');
    const id = rejectingId;

    try {
      const res = await fetch(`/api/eventos/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          estado: 'RECHAZADO',
          justificacion: justificacion.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al rechazar la reserva.');
      }

      setSuccess('Reserva rechazada con éxito.');
      setRejectingId(null);
      setJustificacion('');
      fetchCola();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartAI = async (item) => {
    setError('');
    setSuccess('');
    setAnalyzingItem(item);
    setLoadingAI(true);
    setAiData(null);
    setSelectedSpaceId('');
    setProposalReason('');

    try {
      const res = await fetch(`/api/coordinador/analisis-ia/${item.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al obtener análisis de IA.');

      setAiData(data);
      const defaultSuggested = data.analisisIA?.espacioSugeridoId || (data.espaciosCompatibles && data.espaciosCompatibles[0]?.id) || '';
      setSelectedSpaceId(defaultSuggested);
      const cleanedRec = data.analisisIA?.recomendacion
        ? data.analisisIA.recomendacion.replace(/^Sugerencia de IA \(fallback\):\s*/i, '').replace(/^Sugerencia de IA:\s*/i, '').replace(/^\(fallback\):\s*/i, '')
        : 'Se sugiere reasignación a un aula adecuada.';
      setProposalReason(cleanedRec);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSendProposalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSpaceId) {
      setError('Debes seleccionar un espacio alternativo.');
      return;
    }

    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/eventos/${analyzingItem.id}/proponer-cambio`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nuevoEspacioId: selectedSpaceId,
          motivo: proposalReason,
          sugerenciaIA: aiData?.analisisIA?.recomendacion
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al proponer cambio de espacio.');

      setSuccess('Propuesta de reasignación enviada al solicitante con éxito.');
      setAnalyzingItem(null);
      fetchCola();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateStr) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { ...options, timeZone: 'UTC' });
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 1:
        return 'bg-rose-950/80 text-rose-200 border-rose-600 font-bold';
      case 2:
        return 'bg-amber-950/80 text-amber-200 border-amber-600 font-bold';
      case 3:
        return 'bg-blue-950/80 text-blue-200 border-blue-600 font-bold';
      case 4:
        return 'bg-indigo-950/80 text-indigo-200 border-indigo-600 font-bold';
      case 5:
        return 'bg-slate-900 text-slate-200 border-slate-700 font-bold';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Award className="h-6 w-6 text-blue-500" />
          Cola de Solicitudes Pendientes
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Atiende solicitudes para la optimización y reasignación de espacios
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-rose-500/10 border-2 border-rose-500/40 text-rose-700 dark:text-rose-200 font-semibold rounded-lg flex items-start space-x-2 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 font-semibold rounded-lg flex items-start space-x-2 text-sm">
          <Check className="h-5 w-5 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* AI Analysis & Reassignment Modal / Form */}
      {analyzingItem && (
        <div className="p-6 bg-slate-900 border-2 border-indigo-500/60 rounded-2xl shadow-2xl space-y-4 text-slate-100">
          <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
            <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
              Análisis de Reasignación: <span className="text-indigo-300">{analyzingItem.titulo}</span>
            </h3>
            <button
              onClick={() => setAnalyzingItem(null)}
              className="text-slate-300 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded"
            >
              Cerrar
            </button>
          </div>

          {loadingAI ? (
            <div className="py-8 text-center text-sm text-indigo-300 font-medium flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 animate-spin text-indigo-400" />
              El sistema está analizando aforos, horarios y espacios compatibles...
            </div>
          ) : (
            <form onSubmit={handleSendProposalSubmit} className="space-y-4 text-xs">
              
              {/* IA Card */}
              {aiData?.analisisIA && (
                <div className="p-4 bg-indigo-950/80 border-2 border-indigo-400/60 rounded-xl space-y-2 text-slate-100 shadow-md">
                  <p className="font-bold text-indigo-200 flex items-center gap-1.5 text-xs">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    Recomendación de Reasignación:
                  </p>
                  <p className="text-slate-100 text-xs leading-relaxed font-medium pl-5">
                    {aiData.analisisIA.recomendacion.replace(/^Sugerencia de IA \(fallback\):\s*/i, '').replace(/^Sugerencia de IA:\s*/i, '').replace(/^\(fallback\):\s*/i, '')}
                  </p>
                </div>
              )}

              {/* Space Selection */}
              <div>
                <label className="block font-bold text-slate-200 mb-1.5">
                  Seleccionar Espacio Alternativo Propuesto *
                </label>
                <select
                  value={selectedSpaceId}
                  onChange={(e) => setSelectedSpaceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {aiData?.espaciosCompatibles?.map((esp) => (
                    <option key={esp.id} value={esp.id}>
                      {esp.nombre} — Capacidad: {esp.capacidad} est. ({esp.tipo}) {esp.id === analyzingItem.espacioId ? '(Espacio Solicitado Actual)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Motive */}
              <div>
                <label className="block font-bold text-slate-200 mb-1.5">
                  Motivo / Mensaje de la Propuesta para el Solicitante *
                </label>
                <textarea
                  required
                  value={proposalReason}
                  onChange={(e) => setProposalReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 h-24 resize-none leading-relaxed"
                  placeholder="Explica la razón del cambio propuesto..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAnalyzingItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Send className="h-4 w-4" />
                  Enviar Propuesta al Solicitante
                </button>
              </div>

            </form>
          )}
        </div>
      )}

      {/* Rejection Modal/Form */}
      {rejectingId && (
        <div className="p-5 bg-rose-950/90 border-2 border-rose-500/70 rounded-xl space-y-3 shadow-xl text-rose-100">
          <h4 className="text-sm font-bold text-rose-200 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            Rechazar Reserva
          </h4>
          <form onSubmit={handleRejectSubmit} className="space-y-3">
            <div>
              <label htmlFor="reject-just" className="block text-xs font-bold text-rose-200 mb-1">
                Motivo / Justificación del Rechazo *
              </label>
              <textarea
                id="reject-just"
                required
                placeholder="Indica el motivo del rechazo del espacio..."
                value={justificacion}
                onChange={(e) => setJustificacion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50 h-20 resize-none"
              />
            </div>
            <div className="flex space-x-2 justify-end">
              <button
                type="button"
                onClick={() => { setRejectingId(null); setJustificacion(''); }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-md"
              >
                Confirmar Rechazo
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Cargando cola de solicitudes...
        </div>
      ) : cola.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          La cola de solicitudes está vacía. ¡Excelente trabajo!
        </div>
      ) : (
        <div className="space-y-4">
          {cola.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md rounded-xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              
              {/* Request Details */}
              <div className="space-y-2 flex-grow">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadge(item.prioridad)}`}>
                    Prioridad {item.prioridad}
                  </span>
                  <h3 className="text-md font-bold text-slate-900 dark:text-slate-100">{item.titulo}</h3>
                  <span className="text-[10px] font-mono text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-1">
                    {item.tipo}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">{item.descripcion || 'Sin descripción.'}</p>

                {/* Subinfo */}
                <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                    <span className="font-semibold text-slate-850 dark:text-slate-200">{item.espacio.nombre}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="font-mono">{formatDate(item.fecha)} ({item.horaInicio} - {item.horaFin})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>Asistentes: {item.asistentesEstimados}</span>
                  </div>
                </div>

                {/* Requester Info */}
                <div className="pt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-500">
                  <User className="h-3.5 w-3.5" />
                  <span>
                    Solicitado por: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.usuario.nombre}</span> ({item.usuario.email})
                    {item.usuario.escuela && ` - Escuela de ${item.usuario.escuela.nombre}`}
                  </span>
                </div>
              </div>

              {/* Actions buttons */}
              <div className="shrink-0 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(item)}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:hover:bg-blue-600/30 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 font-medium text-xs rounded-lg transition-all flex items-center gap-1"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleStartAI(item)}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-medium text-xs rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Analizar / Reasignar
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(item.id)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98] flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => setRejectingId(item.id)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-600/20 dark:hover:bg-rose-600/30 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 font-medium text-xs rounded-lg transition-all flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  Rechazar
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal para editar evento como Coordinador */}
      {editingItem && (
        <EditEventModal
          token={token}
          evento={editingItem}
          onClose={() => setEditingItem(null)}
          onEventUpdated={() => {
            setSuccess('Evento editado y auditado exitosamente.');
            fetchCola();
          }}
        />
      )}

    </div>
  );
}
