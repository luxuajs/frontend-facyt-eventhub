import React, { useState, useEffect } from 'react';
import { BookOpen, CheckSquare, Square, Loader2, X, CheckCircle, AlertCircle, FlaskConical } from 'lucide-react';

export default function MateriaAssignmentModal({ espacio, token, onClose, onUpdated }) {
  const [materias, setMaterias] = useState([]);
  const [selectedMateriaIds, setSelectedMateriaIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        // Cargar todas las materias activas
        const resMaterias = await fetch('/api/materias?soloActivas=true', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resMaterias.ok) {
          const data = await resMaterias.json();
          setMaterias(data);
        }

        // Cargar materias ya asignadas a este espacio
        const resEspacioMaterias = await fetch(`/api/materias/espacio/${espacio.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resEspacioMaterias.ok) {
          const asignadas = await resEspacioMaterias.json();
          setSelectedMateriaIds(asignadas.map((m) => m.id));
        }
      } catch (err) {
        console.error('Error al cargar materias:', err);
        setError('Error al cargar materias disponibles.');
      } finally {
        setLoading(false);
      }
    };

    if (espacio) initData();
  }, [espacio, token]);

  const toggleMateriaSelection = (id) => {
    setSelectedMateriaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveAssignment = async () => {
    try {
      setSubmitting(true);
      setError('');
      setSuccessMsg('');

      const res = await fetch(`/api/materias/espacio/${espacio.id}/asignar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ materiaIds: selectedMateriaIds })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al asignar materias.');

      setSuccessMsg(`Materias asignadas a "${espacio.nombre}" con éxito.`);
      if (onUpdated) onUpdated();
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Asignar Materias a Espacio</h2>
              <p className="text-xs text-slate-400">
                Seleccioná las materias que requieren o pueden usar <strong className="text-emerald-300">{espacio?.nombre}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
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

          {loading ? (
            <div className="py-12 flex justify-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : materias.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm bg-slate-950/20 rounded-xl border border-slate-800">
              No hay materias activas disponibles. Registrá materias primero desde la opción de Catálogo de Materias.
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Materias Disponibles ({selectedMateriaIds.length} seleccionada(s))
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {materias.map((materia) => {
                  const isSelected = selectedMateriaIds.includes(materia.id);
                  return (
                    <div
                      key={materia.id}
                      onClick={() => toggleMateriaSelection(materia.id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-600 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{materia.nombre}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          {materia.codigo && <span className="font-mono text-slate-300">{materia.codigo}</span>}
                          {materia.escuela && <span>• Escuela de {materia.escuela.nombre}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveAssignment}
            disabled={submitting || loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
            Guardar Asignación
          </button>
        </div>
      </div>
    </div>
  );
}
