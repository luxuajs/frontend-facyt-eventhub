import React, { useState, useEffect } from 'react';
import { Award, Check, X, MapPin, Clock, Users, User, AlertTriangle, AlertCircle } from 'lucide-react';

export default function CoordinatorQueue({ token }) {
  const [cola, setCola] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [justificacion, setJustificacion] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      // Actualizar estado dinámicamente sin recargar
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

  const formatDate = (dateStr) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { ...options, timeZone: 'UTC' });
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 1:
        return 'bg-rose-950/60 text-rose-400 border-rose-800'; // Urgencia Máxima
      case 2:
        return 'bg-amber-950/60 text-amber-400 border-amber-800';
      case 3:
        return 'bg-blue-950/60 text-blue-400 border-blue-800';
      case 4:
        return 'bg-indigo-950/60 text-indigo-400 border-indigo-800';
      case 5:
        return 'bg-slate-805 bg-slate-800 text-slate-300 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
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
          Atiende y procesa solicitudes de reserva ordenadas por el motor de prioridades institucional de FaCyT (FIFO)
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400 rounded-lg flex items-start space-x-2 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-lg flex items-start space-x-2 text-sm">
          <Check className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Rejection Modal/Form */}
      {rejectingId && (
        <div className="p-5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            Rechazar Reserva
          </h4>
          <form onSubmit={handleRejectSubmit} className="space-y-3">
            <div>
              <label htmlFor="reject-just" className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                Motivo / Justificación del Rechazo *
              </label>
              <textarea
                id="reject-just"
                required
                placeholder="Indica el motivo del rechazo del espacio (ej. Falta de exclusividad o choque de laboratorio)..."
                value={justificacion}
                onChange={(e) => setJustificacion(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 h-20 resize-none"
              />
            </div>
            <div className="flex space-x-2 justify-end">
              <button
                type="button"
                onClick={() => { setRejectingId(null); setJustificacion(''); }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg shadow-sm"
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
                  onClick={() => handleApprove(item.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98] flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => setRejectingId(item.id)}
                  className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-medium text-sm rounded-lg transition-all flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Rechazar
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
