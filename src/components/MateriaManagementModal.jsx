import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Power, School, Loader2, X, CheckCircle, AlertCircle, FlaskConical } from 'lucide-react';

export default function MateriaManagementModal({ token, onClose }) {
  const [materias, setMaterias] = useState([]);
  const [escuelas, setEscuelas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [escuelaId, setEscuelaId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchMaterias = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/materias', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMaterias(data);
      }
    } catch (err) {
      console.error('Error al obtener materias:', err);
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

    fetchMaterias();
  }, [token]);

  const handleCreateMateria = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('Ingresá el nombre de la materia.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccessMsg('');

      const res = await fetch('/api/materias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          codigo: codigo.trim(),
          escuelaId: escuelaId || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear materia.');

      setSuccessMsg(`Materia "${data.nombre}" agregada con éxito.`);
      setNombre('');
      setCodigo('');
      setEscuelaId('');
      fetchMaterias();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleEstado = async (materia) => {
    try {
      setError('');
      setSuccessMsg('');
      const nuevoEstado = !materia.activo;

      const res = await fetch(`/api/materias/${materia.id}/estado`, {
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
      fetchMaterias();
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
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Catálogo de Materias de la Carrera</h2>
              <p className="text-xs text-slate-400">Registrá materias académicas e inhabilitá las descontinuadas</p>
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

          {/* Formulario de alta */}
          <form onSubmit={handleCreateMateria} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" /> Nueva Materia
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Nombre de la Materia *</label>
                <input
                  type="text"
                  placeholder="Ej: Programación Orientada a Objetos"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/60 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Código (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: CI-2691"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/60 rounded-xl text-sm text-white uppercase focus:outline-none focus:border-indigo-500/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Escuela / Carrera *</label>
              <select
                value={escuelaId}
                onChange={(e) => setEscuelaId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/60 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/60"
              >
                <option value="">Seleccionar Escuela...</option>
                {escuelas.map((esc) => (
                  <option key={esc.id} value={esc.id}>{esc.nombre}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Registrar Materia
              </button>
            </div>
          </form>

          {/* Listado de Materias */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Materias Registradas ({materias.length})</h3>

            {loading ? (
              <div className="py-8 flex justify-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : materias.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm bg-slate-950/20 rounded-xl border border-slate-800">
                No hay materias registradas aún.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {materias.map((mat) => (
                  <div
                    key={mat.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                      mat.activo
                        ? 'bg-slate-900/80 border-slate-800'
                        : 'bg-slate-950/60 border-slate-900 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {mat.codigo && (
                          <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-xs font-mono text-indigo-300 rounded-md">
                            {mat.codigo}
                          </span>
                        )}
                        <span className="font-semibold text-sm text-slate-100">{mat.nombre}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            mat.activo
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {mat.activo ? 'ACTIVA' : 'INHABILITADA'}
                        </span>
                      </div>
                      {mat.escuela && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <School className="w-3 h-3 text-slate-500" /> Escuela de {mat.escuela.nombre}
                        </p>
                      )}
                      {mat.espacio && (
                        <p className="text-xs text-emerald-400/90 mt-1 flex items-center gap-1.5 font-medium">
                          <FlaskConical className="w-3 h-3 text-emerald-500" /> Laboratorio: {mat.espacio.nombre}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleEstado(mat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                        mat.activo
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {mat.activo ? 'Inhabilitar' : 'Habilitar'}
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
