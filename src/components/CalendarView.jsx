import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock, Filter, Columns, LayoutGrid, CalendarDays, Megaphone, QrCode } from 'lucide-react';
import PromoteEventModal from './PromoteEventModal';
import QRModal from './QRModal';

const WEEKDAYS = [
  { dayIndex: 1, label: 'Lunes', short: 'Lun', color: 'border-blue-500/30 bg-blue-500/5 text-blue-400' },
  { dayIndex: 2, label: 'Martes', short: 'Mar', color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' },
  { dayIndex: 3, label: 'Miércoles', short: 'Mié', color: 'border-violet-500/30 bg-violet-500/5 text-violet-400' },
  { dayIndex: 4, label: 'Jueves', short: 'Jue', color: 'border-amber-500/30 bg-amber-500/5 text-amber-400' },
  { dayIndex: 5, label: 'Viernes', short: 'Vie', color: 'border-pink-500/30 bg-pink-500/5 text-pink-400' },
  { dayIndex: 6, label: 'Sábado', short: 'Sáb', color: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400' },
];

export default function CalendarView({ token, user, onNavigate }) {
  const [eventos, setEventos] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [filterEspacio, setFilterEspacio] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' | 'list'
  const [selectedMobileDay, setSelectedMobileDay] = useState('ALL');
  const [promotingEvento, setPromotingEvento] = useState(null);
  const [qrEvento, setQrEvento] = useState(null);

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

  const filteredEventos = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    return eventos.filter((evento) => {
      if (filterEspacio !== 'ALL' && evento.espacioId !== filterEspacio) {
        return false;
      }

      if (!evento.fecha) return false;
      const [year, month, day] = evento.fecha.split('T')[0].split('-').map(Number);
      const eventDate = new Date(year, month - 1, day);

      if (eventDate < today) {
        return false;
      }

      if (eventDate.getTime() === today.getTime() && evento.horaFin) {
        const [hFin, mFin] = evento.horaFin.split(':').map(Number);
        const eventEnd = new Date();
        eventEnd.setHours(hFin, mFin, 0, 0);
        if (now > eventEnd) {
          return false;
        }
      }

      return true;
    });
  }, [eventos, filterEspacio]);

  // Devuelve el índice del día en UTC (0=Dom, 1=Lun, ..., 6=Sáb)
  const getUTCDayIndex = (dateStr) => {
    if (!dateStr) return -1;
    const date = new Date(dateStr);
    return date.getUTCDay();
  };

  // Agrupa eventos por día de la semana (1 a 6) y los ordena por horaInicio asc
  const eventsByDay = useMemo(() => {
    const grouped = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

    filteredEventos.forEach((evento) => {
      const dayIdx = getUTCDayIndex(evento.fecha);
      if (grouped[dayIdx]) {
        grouped[dayIdx].push(evento);
      }
    });

    Object.keys(grouped).forEach((dayKey) => {
      grouped[dayKey].sort((a, b) => (a.horaInicio || '00:00').localeCompare(b.horaInicio || '00:00'));
    });

    return grouped;
  }, [filteredEventos]);

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
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

  const renderEventCard = (evento) => (
    <div
      key={evento.id}
      onClick={() => setQrEvento(evento)}
      className="p-4 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-blue-500 dark:hover:border-blue-500/50 shadow-sm hover:shadow-md transition-all duration-150 flex flex-col justify-between space-y-3 relative group cursor-pointer"
    >
      <div className="space-y-2">
        {/* Badge Priority & Space Type */}
        <div className="flex justify-between items-center">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriorityBadgeClass(evento.prioridad)}`}>
            P{evento.prioridad}
          </span>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {evento.espacio.tipo}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-sm font-bold text-slate-950 dark:text-slate-100 line-clamp-2">{evento.titulo}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
            {evento.descripcion || 'Sin descripción.'}
          </p>
        </div>

        {/* Space and Schedule Details */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{evento.espacio.nombre}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="font-mono text-cyan-400 font-semibold">{evento.horaInicio} - {evento.horaFin}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{formatDate(evento.fecha)}</span>
          </div>
        </div>
      </div>

      {/* Event requester & Promotion */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400 dark:text-slate-500">Por:</span>
          <span className="font-medium text-slate-800 dark:text-slate-300 truncate max-w-[140px]">{evento.usuario.nombre}</span>
        </div>

        {/* Botón Promocionar */}
        {token && user && (user.rol === 'ROOT' || user.rol === 'COORDINADOR' || (user.rol === 'SOLICITANTE' && (evento.usuarioId === user.id || (evento.usuario && evento.usuario.id === user.id)))) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPromotingEvento(evento);
            }}
            className="w-full py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Megaphone className="h-3.5 w-3.5" />
            Promocionar Evento
          </button>
        )}

        {/* Botón Código QR / Asistencia */}
        <button
          type="button"
          onClick={() => setQrEvento(evento)}
          className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
        >
          <QrCode className="h-3.5 w-3.5 text-blue-500" />
          Ver QR / Asistencia
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Title & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-blue-500" />
            Calendario de Eventos FaCyT
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Eventos organizados por día de la semana (Lunes a Sábado) en orden cronológico
          </p>
        </div>

        {/* View Controls & Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('weekly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'weekly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              Por Días
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Todos
            </button>
          </div>

          {/* Space Filter Dropdown */}
          <div className="flex items-center space-x-2 flex-grow sm:flex-grow-0">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={filterEspacio}
              onChange={(e) => setFilterEspacio(e.target.value)}
              className="w-full sm:w-56 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="ALL">Todos los Espacios</option>
              {espacios.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>

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
      ) : viewMode === 'weekly' ? (
        <div className="space-y-6">

          {/* Selector de día para pantallas pequeñas / móviles */}
          <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedMobileDay('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                selectedMobileDay === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Todos los días
            </button>
            {WEEKDAYS.map((day) => {
              const count = eventsByDay[day.dayIndex]?.length || 0;
              return (
                <button
                  key={day.dayIndex}
                  onClick={() => setSelectedMobileDay(day.dayIndex)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all ${
                    selectedMobileDay === day.dayIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span>{day.label}</span>
                  <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid de 6 días (Lunes a Sábado) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {WEEKDAYS.filter(day => selectedMobileDay === 'ALL' || selectedMobileDay === day.dayIndex).map((day) => {
              const dayEvents = eventsByDay[day.dayIndex] || [];

              return (
                <div
                  key={day.dayIndex}
                  className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-3 border border-slate-200/70 dark:border-slate-800/60 flex flex-col min-h-[320px]"
                >
                  {/* Cabecera del día */}
                  <div className={`p-2.5 rounded-xl border mb-3 flex items-center justify-between font-semibold ${day.color}`}>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      <span className="text-sm font-bold">{day.label}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/10 dark:bg-slate-100/10 font-mono">
                      {dayEvents.length}
                    </span>
                  </div>

                  {/* Lista de eventos del día */}
                  {dayEvents.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-slate-600">
                      <p className="text-xs">Sin eventos</p>
                    </div>
                  ) : (
                    <div className="space-y-3 flex-1">
                      {dayEvents.map(renderEventCard)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* Vista Lista General */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEventos.map(renderEventCard)}
        </div>
      )}

      {promotingEvento && (
        <PromoteEventModal
          evento={promotingEvento}
          onClose={() => setPromotingEvento(null)}
          token={token}
        />
      )}

      {qrEvento && (
        <QRModal
          evento={qrEvento}
          token={token}
          user={user}
          onClose={() => setQrEvento(null)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

