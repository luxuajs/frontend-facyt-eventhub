import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock, Filter, Layers } from 'lucide-react';

export default function CalendarView() {
  const [eventos, setEventos] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [filterEspacio, setFilterEspacio] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEvents, resSpaces] = await Promise.all([
          fetch('/api/eventos/calendario'),
          fetch('/api/eventos/espacios')
        ]);
        const eventsData = await resEvents.json();
        const spacesData = await resSpaces.json();
        
        if (Array.isArray(eventsData)) setEventos(eventsData);
        if (Array.isArray(spacesData)) setEspacios(spacesData);
      } catch (err) {
        console.error('Error al cargar datos del calendario:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEventos = filterEspacio === 'ALL'
    ? eventos
    : eventos.filter(e => e.espacioId === filterEspacio);

  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { ...options, timeZone: 'UTC' });
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 1: return 'bg-rose-950/60 text-rose-400 border-rose-800';
      case 2: return 'bg-amber-950/60 text-amber-400 border-amber-800';
      case 3: return 'bg-blue-950/60 text-blue-400 border-blue-800';
      case 4: return 'bg-indigo-950/60 text-indigo-400 border-indigo-800';
      case 5: return 'bg-slate-800 text-slate-300 border-slate-700';
      default: return 'bg-slate-850 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-blue-500" />
            Calendario de Eventos FaCyT
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Visualiza las reservas aprobadas y la ocupación de espacios de la facultad
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={filterEspacio}
            onChange={(e) => setFilterEspacio(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="ALL">Todos los Espacios</option>
            {espacios.map(e => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Cargando calendario...
        </div>
      ) : filteredEventos.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-250 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          No hay reservas aprobadas en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEventos.map((evento) => (
            <div
              key={evento.id}
              className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md rounded-xl shadow-md hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Badge Priority & Space Type */}
                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriorityBadgeClass(evento.prioridad)}`}>
                    Prioridad {evento.prioridad}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {evento.espacio.tipo}
                  </span>
                </div>

                {/* Title & Desc */}
                <div>
                  <h3 className="text-md font-bold text-slate-950 dark:text-slate-100 line-clamp-1">{evento.titulo}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {evento.descripcion || 'Sin descripción.'}
                  </p>
                </div>

                {/* Space and Schedule Details */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{evento.espacio.nombre}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="font-mono">{formatDate(evento.fecha)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-mono font-medium pl-5 text-cyan-400">
                      {evento.horaInicio} - {evento.horaFin}
                    </span>
                  </div>
                </div>

              </div>

              {/* Event requester */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Solicitado por:</span>
                <span className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate max-w-40">{evento.usuario.nombre}</span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
