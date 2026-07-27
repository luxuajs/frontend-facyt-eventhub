import React, { useState, useEffect } from 'react';
import { Layers, Plus, Power, School, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function AreaManagementModal({ token, onClose }) {
  const [areas, setAreas] = useState([]);
  const [escuelas, setEscuelas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [escuelaId, setEscuelaId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/areas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAreas(data);
      }
    } catch (err) {
      console.error('Error al obtener áreas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/eventos/escuelas')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEscuelas(data);
      })
      .catch((err) => console.error('Error al cargar escuelas:', err));

    fetchAreas();
  }, [token]);

  const handleCreateArea = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('Ingresá el nombre del área.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccessMsg('');

      const res = await fetch('/api/areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          escuelaId: escuelaId || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear área.');

      setSuccessMsg(`Área "${data.nombre}" creada con éxito.`);
      setNombre('');
      setDescripcion('');
      setEscuelaId('');
      fetchAreas();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleEstado = async (area) => {
    try {
      setError('');
      setSuccessMsg('');
      const nuevoEstado = !area.activo;

      const res = await fetch(`/api/areas/${area.id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ activo: nuevoEstado })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cambiar estado.');

      setSuccessMsg(data.message);
      fetchAreas();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Gestión de Áreas Académicas</h2>
              <p className="text-xs text-slate-400">Creá áreas y configurá su estado activo o inhabilitado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Formular de alta */}
          <form onSubmit={handleCreateArea} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" /> Nueva Área
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nombre del Área *</label>
                <input
                  type="text"
                  placeholder="Ej: Laboratorio de Microprocesadores"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/60 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Escuela Perteneciente (Opcional)</label>
                <select
                  value={escuelaId}
                  onChange={(e) => setEscuelaId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/60 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/60"
                >
                  <option value="">Todas / Institucional</option>
                  {escuelas.map((esc) => (
                    <option key={esc.id} value={esc.id}>{esc.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Descripción</label>
              <input
                type="text"
                placeholder="Descripción del propósito del área..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/60 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/60"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Agregar Área
              </button>
            </div>
          </form>

          {/* Listado de Áreas */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Áreas Registradas ({areas.length})</h3>

            {loading ? (
              <div className="py-8 flex justify-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : areas.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm bg-slate-950/20 rounded-xl border border-slate-800">
                No hay áreas registradas aún.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {areas.map((area) => (
                  <div
                    key={area.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                      area.activo
                        ? 'bg-slate-900/80 border-slate-800'
                        : 'bg-slate-950/60 border-slate-900 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-100">{area.nombre}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            area.activo
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {area.activo ? 'ACTIVO' : 'INHABILITADO'}
                        </span>
                      </div>
                      {area.escuela && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <School className="w-3 h-3 text-slate-500" /> {area.escuela.nombre}
                        </p>
                      )}
                      {area.descripcion && <p className="text-xs text-slate-400 italic mt-0.5">{area.descripcion}</p>}
                    </div>

                    <button
                      onClick={() => handleToggleEstado(area)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                        area.activo
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {area.activo ? 'Inhabilitar' : 'Habilitar'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
