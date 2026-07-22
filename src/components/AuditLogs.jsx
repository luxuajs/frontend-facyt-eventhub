import React, { useState, useEffect } from 'react';
import { ShieldAlert, Database, Search, Calendar, User } from 'lucide-react';

export default function AuditLogs({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/auditoria', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLogs(data);
      })
      .catch(err => console.error('Error al cargar logs de auditoría:', err))
      .finally(() => setLoading(false));
  }, [token]);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.accion.toLowerCase().includes(q) ||
      log.detalles.toLowerCase().includes(q) ||
      log.usuario.nombre.toLowerCase().includes(q) ||
      log.usuario.email.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('es-ES', { timeZone: 'UTC' });
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
            Historial de Auditoría Inmutable
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Trazabilidad completa de las aprobaciones, rechazos e invitaciones (Exclusivo ROOT)
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar por acción, usuario o detalles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Cargando logs de auditoría...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          No se encontraron registros de auditoría.
        </div>
      ) : (
        
        /* Table Container */
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <th className="p-4">Marca de Tiempo</th>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Acción</th>
                  <th className="p-4">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>

                    {/* Usuario */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{log.usuario.nombre}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{log.usuario.email}</div>
                    </td>

                    {/* Acción */}
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        {log.accion}
                      </span>
                    </td>

                    {/* Detalles */}
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs md:max-w-md lg:max-w-lg leading-relaxed">
                      {log.detalles}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
