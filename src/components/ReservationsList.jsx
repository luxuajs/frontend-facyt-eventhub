import React, { useState, useEffect } from 'react';
import { CalendarRange, Sparkles, MapPin, Clock, Info } from 'lucide-react';

export default function ReservationsList({ token }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [token]);

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
          Consulta el estado y respuestas de tus solicitudes en cola de procesamiento
        </p>
      </div>

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
              className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md rounded-xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              
              {/* Event Main Details */}
              <div className="space-y-2 flex-grow">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-md font-bold text-slate-900 dark:text-slate-100">{reserva.titulo}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(reserva.estado)}`}>
                    {reserva.estado}
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

                {/* IA Suggestion / Reason in case of rejection */}
                {reserva.sugerenciaIA && (
                  <div className="mt-3 p-3 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-400 rounded-lg flex items-start space-x-2 text-xs">
                    <Sparkles className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <p className="font-semibold">Detalles / Comentario del Coordinador:</p>
                      <p className="mt-0.5">{reserva.sugerenciaIA}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Display priority badge on the right */}
              <div className="shrink-0 flex items-center md:justify-end">
                <span className="text-xs font-mono px-3 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                  Prioridad: {reserva.prioridad}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
