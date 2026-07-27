import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, AlertTriangle, Building, Layers, BookOpen } from 'lucide-react';
import ModalAlert from './ModalAlert';

export default function NewReservationForm({ token, user, onReservationCreated }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('Clase Teórica');
  const [carrera, setCarrera] = useState('Computación');
  const [materia, setMateria] = useState('');
  const [asistentesEstimados, setAsistentesEstimados] = useState('');
  const [espacioId, setEspacioId] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  // Modo de asignación: 'SUGERIDO' (Automático por el sistema) o 'PERSONAL' (Elección manual del solicitante)
  const [modoAsignacion, setModoAsignacion] = useState('SUGERIDO');
  const [sugerenciasAuto, setSugerenciasAuto] = useState(null);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);

  const [espacios, setEspacios] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado para respuestas de conflicto/elección personal
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

  // Obtención automática de opciones sugeridas cuando se completan datos requeridos
  useEffect(() => {
    if (!tipo || !fecha || !horaInicio || !horaFin || !asistentesEstimados) {
      setSugerenciasAuto(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSugerencias(true);
      try {
        const res = await fetch('/api/eventos/sugerir-espacios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            tipo,
            carrera: ['Clase Teórica', 'Clase de Laboratorio'].includes(tipo) ? carrera : null,
            materia: tipo === 'Clase de Laboratorio' ? materia : null,
            asistentesEstimados: parseInt(asistentesEstimados),
            fecha,
            horaInicio,
            horaFin
          })
        });

        if (res.ok) {
          const data = await res.json();
          setSugerenciasAuto(data);
          // Si estamos en modo sugerido y hay una mejor opción, auto-seleccionarla
          if (modoAsignacion === 'SUGERIDO' && data.mejorOpcion) {
            setEspacioId(data.mejorOpcion.id);
          }
        }
      } catch (err) {
        console.error('Error al obtener sugerencias de espacios:', err);
      } finally {
        setLoadingSugerencias(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [tipo, carrera, materia, asistentesEstimados, fecha, horaInicio, horaFin, token, modoAsignacion]);

  const [reservaDirecta, setReservaDirecta] = useState(false);
  const isCoordinadorOrRoot = ['COORDINADOR', 'ROOT'].includes(user?.rol);

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
          carrera: ['Clase Teórica', 'Clase de Laboratorio'].includes(tipo) ? carrera : null,
          materia: tipo === 'Clase de Laboratorio' ? materia : null,
          asistentesEstimados: parseInt(asistentesEstimados),
          espacioId,
          fecha,
          horaInicio,
          horaFin,
          reservaDirecta: isCoordinadorOrRoot ? reservaDirecta : false
        })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error(`Error al procesar la respuesta del servidor (Estado: ${res.status}). Por favor intente nuevamente.`);
      }

      if (res.status === 409) {
        // Capturar conflicto y presentar alternativas de elección personal
        setCollisionInfo({
          message: data.error,
          tipoConflicto: data.tipoConflicto || 'HORARIO',
          sugerenciaIA: data.sugerenciaIA,
          sugerenciasMismoEspacio: data.sugerenciasMismoEspacio || [],
          opcionesSugeridas: data.opcionesSugeridas || data.espaciosSugeridos || [],
          fechaPropuesta: data.fechaPropuesta,
          horaInicioPropuesta: data.horaInicioPropuesta,
          horaFinPropuesta: data.horaFinPropuesta,
          espacioSugeridoId: data.espacioSugeridoId,
          espacioSugeridoNombre: data.espacioSugeridoNombre
        });
        setError('Conflicto detectado en la reserva. Revisa las opciones sugeridas abajo.');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la solicitud.');
      }

      setSuccess(data.message || 'Solicitud de reserva enviada con éxito.');
      
      // Limpiar formulario
      setTitulo('');
      setDescripcion('');
      setAsistentesEstimados('');
      setFecha('');
      setHoraInicio('');
      setHoraFin('');
      setSugerenciasAuto(null);
      setCollisionInfo(null);

      if (onReservationCreated) {
        setTimeout(() => onReservationCreated(), 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTimeSuggestion = (propFecha, propInicio, propFin) => {
    if (propFecha && propInicio && propFin) {
      setFecha(propFecha);
      setHoraInicio(propInicio);
      setHoraFin(propFin);
      setCollisionInfo(null);
      setError('');
      setSuccess('Horario sugerido seleccionado. Puedes volver a enviar la solicitud.');
    }
  };

  const handleSelectSuggestedSpace = (targetEspacioId) => {
    if (targetEspacioId) {
      setEspacioId(targetEspacioId);
      setCollisionInfo(null);
      setError('');
      setSuccess('Espacio seleccionado de las opciones sugeridas. Puedes volver a enviar la solicitud.');
    }
  };

  const selectedEspacio = espacios.find(e => e.id === espacioId);
  const requiresCarrera = ['Clase Teórica', 'Clase de Laboratorio'].includes(tipo);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Modal Alert for Errors */}
      <ModalAlert
        isOpen={Boolean(error && !collisionInfo)}
        onClose={() => setError('')}
        title="Error en la solicitud"
        message={error}
        type="error"
      />

      {/* Modal Alert for Success */}
      <ModalAlert
        isOpen={Boolean(success)}
        onClose={() => setSuccess('')}
        title="Operación Exitosa"
        message={success}
        type="success"
      />
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Solicitar Reserva de Espacio
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Completa los datos de la actividad. El sistema sugerirá automáticamente las mejores opciones de espacio disponibles.
        </p>
      </div>

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
                placeholder="Ej. Defensa de Tesis de Computación..."
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  e.target.removeAttribute('aria-invalid');
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
              <label htmlFor="res-tipo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-blue-500" /> Tipo de Evento *
              </label>
              <select
                id="res-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
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

            {/* Carrera (Solo si aplica por Tipo de Evento) */}
            {requiresCarrera && (
              <div>
                <label htmlFor="res-carrera" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-indigo-500" /> Carrera *
                </label>
                <select
                  id="res-carrera"
                  value={carrera}
                  onChange={(e) => {
                    setCarrera(e.target.value);
                    setMateria('');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                >
                  <option value="Computación">Computación</option>
                  <option value="Química">Química</option>
                  <option value="Física">Física</option>
                  <option value="Biología">Biología</option>
                  <option value="Matemáticas">Matemáticas</option>
                </select>
              </div>
            )}

            {/* Materia (Solo si es Clase de Laboratorio) */}
            {tipo === 'Clase de Laboratorio' && (
              <div>
                <label htmlFor="res-materia" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-500" /> Materia / Asignatura *
                </label>
                <select
                  id="res-materia"
                  value={materia}
                  onChange={(e) => setMateria(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
                  required
                >
                  <option value="">-- Seleccionar Materia --</option>
                  {carrera === 'Computación' && (
                    <>
                      <option value="Redes y Telecomunicaciones">Redes y Telecomunicaciones</option>
                      <option value="Sistemas Operativos">Sistemas Operativos</option>
                      <option value="Arquitectura del Computador">Arquitectura del Computador</option>
                      <option value="Bases de Datos">Bases de Datos</option>
                      <option value="Programación">Programación</option>
                      <option value="Estructuras de Datos">Estructuras de Datos</option>
                    </>
                  )}
                  {carrera === 'Química' && (
                    <>
                      <option value="Química Orgánica">Química Orgánica</option>
                      <option value="Química Analítica">Química Analítica</option>
                      <option value="Fisicoquímica">Fisicoquímica</option>
                    </>
                  )}
                  {carrera === 'Física' && (
                    <>
                      <option value="Física Experimental">Física Experimental</option>
                      <option value="Electromagnetismo">Electromagnetismo</option>
                      <option value="Óptica">Óptica</option>
                    </>
                  )}
                  {carrera === 'Biología' && (
                    <>
                      <option value="Microbiología">Microbiología</option>
                      <option value="Genética">Genética</option>
                      <option value="Bioquímica">Bioquímica</option>
                    </>
                  )}
                  {carrera === 'Matemáticas' && (
                    <>
                      <option value="Cálculo Numérico">Cálculo Numérico</option>
                      <option value="Estadística Computacional">Estadística Computacional</option>
                    </>
                  )}
                </select>
              </div>
            )}

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
                  onChange={(e) => setAsistentesEstimados(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
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
                min={(() => {
                  const d = new Date();
                  return d.toISOString().split('T')[0];
                })()}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
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
                onChange={(e) => setHoraInicio(e.target.value)}
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
                onChange={(e) => setHoraFin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
              />
            </div>

          </div>

          {/* Selección del Espacio: Sugerido vs Elección Personal */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Selección de Espacio Físico
              </label>
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setModoAsignacion('SUGERIDO');
                    if (sugerenciasAuto?.mejorOpcion) {
                      setEspacioId(sugerenciasAuto.mejorOpcion.id);
                    }
                  }}
                  className={`px-3 py-1 rounded-md transition-all font-medium ${
                    modoAsignacion === 'SUGERIDO'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Sugerencia Automática
                </button>
                <button
                  type="button"
                  onClick={() => setModoAsignacion('PERSONAL')}
                  className={`px-3 py-1 rounded-md transition-all font-medium ${
                    modoAsignacion === 'PERSONAL'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Elección Personal
                </button>
              </div>
            </div>

            {/* MODO SUGERIDO: Presenta las mejores alternativas de manera automática */}
            {modoAsignacion === 'SUGERIDO' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                {loadingSugerencias ? (
                  <p className="text-xs text-slate-400 animate-pulse">Calculando las mejores alternativas de espacio...</p>
                ) : sugerenciasAuto?.advertenciaAforo ? (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/60 rounded-lg text-xs text-red-700 dark:text-red-300 space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                      <span>Capacidad Excedida en Laboratorio</span>
                    </div>
                    <p>{sugerenciasAuto.advertenciaAforo}</p>
                  </div>
                ) : (
                  <>
                    {sugerenciasAuto?.advertenciaDefensa && (
                      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs text-amber-800 dark:text-amber-300 space-y-2 mb-2">
                        <div className="flex items-center gap-2 font-bold">
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                          <span>Auditorio Requerido para Tesis</span>
                        </div>
                        <p>{sugerenciasAuto.advertenciaDefensa}</p>
                        
                        {sugerenciasAuto.alternativasAuditorio && sugerenciasAuto.alternativasAuditorio.length > 0 && (
                          <div className="mt-2 space-y-1.5 pt-2 border-t border-amber-200/55 dark:border-amber-800/40">
                            <p className="font-semibold text-[11px] uppercase tracking-wider text-amber-900 dark:text-amber-200">Horarios/Días alternativos en el Auditorio:</p>
                            <div className="flex flex-col gap-1.5">
                              {sugerenciasAuto.alternativasAuditorio.map((alt, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    handleApplyTimeSuggestion(alt.fecha, alt.horaInicio, alt.horaFin);
                                    handleSelectSuggestedSpace(alt.espacioId);
                                  }}
                                  className="text-left text-xs bg-white dark:bg-slate-900 border border-amber-300/50 hover:bg-amber-100/60 p-2 rounded-md font-medium text-slate-800 dark:text-slate-200 shadow-sm transition-all"
                                >
                                  {alt.descripcion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {sugerenciasAuto?.opcionesSugeridas && sugerenciasAuto.opcionesSugeridas.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Opciones sugeridas (Máximo 3 mejores alternativas):
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {sugerenciasAuto.opcionesSugeridas.map((esp, i) => {
                            const isSelected = espacioId === esp.id;
                            return (
                              <div
                                key={esp.id}
                                onClick={() => setEspacioId(esp.id)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all text-xs text-left relative ${
                                  isSelected
                                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                                }`}
                              >
                                {i === 0 && (
                                  <span className="absolute top-2 right-2 text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                    Recomendado
                                  </span>
                                )}
                                <p className="font-bold text-slate-900 dark:text-slate-100 pr-12">{esp.nombre}</p>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">Capacidad: {esp.capacidad} pers.</p>
                                {esp.escuelaNombre && (
                                  <p className="text-[10px] text-indigo-500 font-medium">{esp.escuelaNombre}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      !sugerenciasAuto?.advertenciaDefensa && (
                        <p className="text-xs text-slate-500 italic">
                          Completa la fecha, hora y asistentes para recibir sugerencias automáticas de espacios disponibles.
                        </p>
                      )
                    )}
                  </>
                )}
              </div>
            )}

            {/* MODO PERSONAL: Selector manual de todos los espacios */}
            {modoAsignacion === 'PERSONAL' && (
              <div>
                <select
                  id="res-espacio"
                  value={espacioId}
                  onChange={(e) => setEspacioId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                >
                  {espacios.map((esp) => {
                    const isInactive = esp.estado !== 'ACTIVO';
                    return (
                      <option key={esp.id} value={esp.id} disabled={isInactive}>
                        {esp.nombre} (Capacidad: {esp.capacidad}) {isInactive ? `[${esp.estado}]` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

          </div>

          {/* Opción especial para Coordinadores / Root */}
          {isCoordinadorOrRoot && (
            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  Opciones de Coordinación de Espacios
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  Puedes emitir una reserva institucional directa aprobada de inmediato.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-blue-850 dark:text-blue-200">
                <input
                  type="checkbox"
                  checked={reservaDirecta}
                  onChange={(e) => setReservaDirecta(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                />
                Reserva Directa
              </label>
            </div>
          )}

          {/* Metadata especificaciones del espacio seleccionado */}
          {selectedEspacio && (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-850 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Especificaciones de {selectedEspacio.nombre}:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Capacidad: <span className="font-mono text-slate-800 dark:text-slate-200">{selectedEspacio.capacidad} estudiantes</span></li>
                <li>Días Permitidos: <span className="font-mono text-slate-850 dark:text-slate-200">{selectedEspacio.diasPermitidos}</span></li>
                <li>Horario: <span className="font-mono text-slate-850 dark:text-slate-200">{selectedEspacio.horaApertura} - {selectedEspacio.horaCierre}</span></li>
                {selectedEspacio.escuela && (
                  <li>Asociación: <span className="font-medium text-indigo-500">Escuela de {selectedEspacio.escuela.nombre}</span></li>
                )}
              </ul>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98]"
            >
              {loading ? 'Validando disponibilidad...' : 'Enviar Solicitud de Reserva'}
            </button>
          </div>
        </form>
      </div>

      {/* CASOS DE ELECCIÓN PERSONAL Y CONFLICTOS: Paneles de Respuesta / Sugerencias */}
      {collisionInfo && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xl space-y-4">
          
          {/* Header Alerta */}
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <h4 className="text-sm font-bold">
              {collisionInfo.tipoConflicto === 'ESPACIO_INHABILITADO'
                ? 'Espacio No Habilitado'
                : 'Conflicto en el Espacio Seleccionado'}
            </h4>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300">
            {collisionInfo.message}
          </p>

          {/* CASO 1: Elección personal en espacio ocupado -> Sugerencia para ESE MISMO ESPACIO */}
          {collisionInfo.sugerenciasMismoEspacio && collisionInfo.sugerenciasMismoEspacio.length > 0 && (
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Sugerencias para este mismo espacio ({selectedEspacio?.nombre}):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {collisionInfo.sugerenciasMismoEspacio.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col justify-between text-xs space-y-2"
                  >
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                        {alt.tipoAlternativa === 'HORARIO_POSTERIOR' ? 'Horario Posterior' : 'Día Diferente'}
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{alt.descripcion}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyTimeSuggestion(alt.fecha, alt.horaInicio, alt.horaFin)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded transition-all active:scale-95 text-center"
                    >
                      Aplicar esta fecha/horario
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CASO 2 & OPCIONES SUGERIDAS: Espacio inhabilitado -> Presenta las 3 mejores alternativas */}
          {collisionInfo.opcionesSugeridas && collisionInfo.opcionesSugeridas.length > 0 && (
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Opciones sugeridas disponibles (Máximo 3 mejores alternativas):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {collisionInfo.opcionesSugeridas.slice(0, 3).map((esp, i) => (
                  <button
                    key={esp.id}
                    type="button"
                    onClick={() => handleSelectSuggestedSpace(esp.id)}
                    className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 rounded-lg text-left text-xs transition-all space-y-1"
                  >
                    <p className="font-bold text-slate-900 dark:text-slate-100">{esp.nombre}</p>
                    <p className="text-slate-500 dark:text-slate-400">Capacidad: {esp.capacidad} pers.</p>
                    {esp.escuelaNombre && (
                      <p className="text-[10px] text-indigo-500 font-medium">{esp.escuelaNombre}</p>
                    )}
                    <span className="inline-block mt-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 underline">
                      Seleccionar opción
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
