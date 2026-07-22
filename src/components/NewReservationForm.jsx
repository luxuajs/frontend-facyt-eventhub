import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock, HelpCircle, Users, CheckCircle, AlertTriangle } from 'lucide-react';

export default function NewReservationForm({ token, user, onReservationCreated }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('Clase Teórica');
  const [asistentesEstimados, setAsistentesEstimados] = useState('');
  const [espacioId, setEspacioId] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  const [espacios, setEspacios] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para capturar colisiones de IA
  const [collisionInfo, setCollisionInfo] = useState(null);

  useEffect(() => {
    fetch('/api/eventos/espacios')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEspacios(data);
          if (data.length > 0) setEspacioId(data[0].id);
        }
      })
      .catch(err => console.error('Error al cargar espacios:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCollisionInfo(null);

    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.querySelectorAll('input, select').forEach(el => {
        if (!el.checkValidity()) {
          el.setAttribute('aria-invalid', 'true');
        }
      });
      setError('Por favor completa todos los campos requeridos correctamente.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/eventos', {
        method: 'POST',
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

      const data = await res.json();

      if (res.status === 409) {
        // Capturar conflicto y sugerencias de la IA
        setCollisionInfo({
          message: data.error,
          sugerenciaIA: data.sugerenciaIA,
          fechaPropuesta: data.fechaPropuesta,
          horaInicioPropuesta: data.horaInicioPropuesta,
          horaFinPropuesta: data.horaFinPropuesta,
          slotsDisponibles: data.slotsDisponibles || []
        });
        setError('Conflicto detectado en la reserva. Revisa las alternativas sugeridas abajo.');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la solicitud.');
      }

      setSuccess(data.message || 'Solicitud de reserva en cola.');
      
      // Limpiar formulario
      setTitulo('');
      setDescripcion('');
      setAsistentesEstimados('');
      setFecha('');
      setHoraInicio('');
      setHoraFin('');

      if (onReservationCreated) {
        setTimeout(() => onReservationCreated(), 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = (propFecha, propInicio, propFin) => {
    if (propFecha && propInicio && propFin) {
      setFecha(propFecha);
      setHoraInicio(propInicio);
      setHoraFin(propFin);
      setCollisionInfo(null);
      setError('');
      setSuccess('Sugerencia de la IA aplicada. Puedes volver a enviar la solicitud.');
    }
  };

  const selectedEspacio = espacios.find(e => e.id === espacioId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Solicitar Reserva de Espacio
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Envía una solicitud de asignación. El motor anti-solapamiento validará tu reserva en tiempo real.
        </p>
      </div>

      {/* Alerts */}
      {error && !collisionInfo && (
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

      {/* Form Container */}
      <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Título */}
            <div className="md:col-span-2">
              <label htmlFor="res-titulo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Título del Evento o Actividad *
              </label>
              <input
                id="res-titulo"
                type="text"
                required
                placeholder="Defensa de Tesis de Computación..."
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  e.target.removeAttribute('aria-invalid');
                }}
                onBlur={(e) => {
                  if (!e.target.checkValidity()) e.target.setAttribute('aria-invalid', 'true');
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label htmlFor="res-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Descripción / Detalles
              </label>
              <textarea
                id="res-desc"
                placeholder="Especifica detalles adicionales como requerimientos técnicos o ponentes."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-20 resize-none"
              />
            </div>

            {/* Tipo de Evento */}
            <div>
              <label htmlFor="res-tipo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Evento *
              </label>
              <select
                id="res-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="Clase Teórica">Clase Teórica</option>
                <option value="Clase de Laboratorio">Clase de Laboratorio</option>
                <option value="Defensa de Tesis / Jornada de Pasantías">Defensa de Tesis / Jornada de Pasantías</option>
                <option value="Taller / Charla / Conversatorio">Taller / Charla / Conversatorio</option>
                <option value="Reunión Institucional / Actividad Estudiantil">Reunión Institucional / Actividad Estudiantil</option>
              </select>
            </div>

            {/* Asistentes Estimados */}
            <div>
              <label htmlFor="res-asistentes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Asistentes Estimados *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Users className="h-4 w-4" />
                </div>
                <input
                  id="res-asistentes"
                  type="number"
                  required
                  min={1}
                  placeholder="Cantidad"
                  value={asistentesEstimados}
                  onChange={(e) => {
                    setAsistentesEstimados(e.target.value);
                    e.target.removeAttribute('aria-invalid');
                  }}
                  onBlur={(e) => {
                    if (!e.target.checkValidity()) e.target.setAttribute('aria-invalid', 'true');
                  }}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            {/* Espacio Físico */}
            <div>
              <label htmlFor="res-espacio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Espacio Físico *
              </label>
              <select
                id="res-espacio"
                value={espacioId}
                onChange={(e) => setEspacioId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {espacios.map((esp) => (
                  <option key={esp.id} value={esp.id}>
                    {esp.nombre} (Capacidad: {esp.capacidad})
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label htmlFor="res-fecha" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Fecha *
              </label>
              <input
                id="res-fecha"
                type="date"
                required
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  e.target.removeAttribute('aria-invalid');
                }}
                onBlur={(e) => {
                  if (!e.target.checkValidity()) e.target.setAttribute('aria-invalid', 'true');
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
              />
            </div>

            {/* Hora Inicio */}
            <div>
              <label htmlFor="res-inicio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-cyan-400" /> Hora Inicio *
              </label>
              <input
                id="res-inicio"
                type="time"
                required
                value={horaInicio}
                onChange={(e) => {
                  setHoraInicio(e.target.value);
                  e.target.removeAttribute('aria-invalid');
                }}
                onBlur={(e) => {
                  if (!e.target.checkValidity()) e.target.setAttribute('aria-invalid', 'true');
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
              />
            </div>

            {/* Hora Fin */}
            <div>
              <label htmlFor="res-fin" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-cyan-400" /> Hora Fin *
              </label>
              <input
                id="res-fin"
                type="time"
                required
                value={horaFin}
                onChange={(e) => {
                  setHoraFin(e.target.value);
                  e.target.removeAttribute('aria-invalid');
                }}
                onBlur={(e) => {
                  if (!e.target.checkValidity()) e.target.setAttribute('aria-invalid', 'true');
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
              />
            </div>

          </div>

          {/* Metadata info of space */}
          {selectedEspacio && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-850 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Especificaciones de {selectedEspacio.nombre}:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Capacidad: <span className="font-mono text-slate-800 dark:text-slate-200">{selectedEspacio.capacidad} estudiantes</span></li>
                <li>Días Permitidos: <span className="font-mono text-slate-850 dark:text-slate-200">{selectedEspacio.diasPermitidos}</span></li>
                <li>Horario Permitido: <span className="font-mono text-slate-850 dark:text-slate-200">{selectedEspacio.horaApertura} - {selectedEspacio.horaCierre}</span></li>
                {selectedEspacio.escuela && (
                  <li>Exclusividad: <span className="font-medium text-blue-500">Escuela de {selectedEspacio.escuela.nombre}</span></li>
                )}
              </ul>
            </div>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98]"
            >
              {loading ? 'Validando solapamiento...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>

      {/* Sugerencias de Reagendamiento con IA (Borde Gradiente / Sparkles) */}
      {collisionInfo && (
        <div className="p-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 rounded-xl shadow-xl">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-[10px] space-y-4">
            
            {/* Header IA */}
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Asistente de Reagendamiento IA (Gemini)
                </h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  Sugerencia Inteligente Detectada
                </p>
              </div>
            </div>

            {/* Mensaje de la IA */}
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-l-2 border-cyan-400 pl-3">
              {collisionInfo.sugerenciaIA}
            </div>

            {/* Acción de aplicar sugerencia principal */}
            {collisionInfo.fechaPropuesta && collisionInfo.horaInicioPropuesta && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Recomendación Principal:</p>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Fecha: {collisionInfo.fechaPropuesta} | Horario: {collisionInfo.horaInicioPropuesta} - {collisionInfo.horaFinPropuesta}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplySuggestion(collisionInfo.fechaPropuesta, collisionInfo.horaInicioPropuesta, collisionInfo.horaFinPropuesta)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-all active:scale-95 shadow-sm"
                >
                  Aplicar este horario
                </button>
              </div>
            )}

            {/* Otras alternativas en PostgreSQL */}
            {collisionInfo.slotsDisponibles.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-300">Otras alternativas libres:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {collisionInfo.slotsDisponibles.slice(1, 3).map((slot, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplySuggestion(slot.fecha, slot.horaInicio, slot.horaFin)}
                      className="p-2.5 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-left text-xs text-slate-700 dark:text-slate-300 transition-all font-mono"
                    >
                      <p className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider">Alternativa {i+1}</p>
                      <p>{slot.fecha}</p>
                      <p>{slot.horaInicio} - {slot.horaFin}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
