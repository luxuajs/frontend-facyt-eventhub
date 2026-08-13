import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Users, CheckCircle, AlertTriangle, Copy, Check, LogIn } from 'lucide-react';

export default function QRModal({ evento, token, user, onClose, onNavigate }) {
  const [asistenciaData, setAsistenciaData] = useState({
    totalAsistentes: 0,
    capacidadMaxima: evento?.espacio?.capacidad || 0,
    asistioUsuarioActual: false,
    asistentes: []
  });
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const qrUrl = `${window.location.origin}/?asistirEventId=${evento?.id}`;

  const fetchAsistencia = async () => {
    if (!evento?.id) return;
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/eventos/${evento.id}/asistencia`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAsistenciaData(data);
      }
    } catch (err) {
      console.error('Error al obtener asistencia:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsistencia();
  }, [evento?.id, token]);

  const handleConfirmarAsistencia = async () => {
    if (!token) {
      setError('Debes iniciar sesión para registrar tu asistencia a este evento.');
      return;
    }

    setConfirming(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/eventos/${evento.id}/asistir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar la asistencia.');

      setMessage(data.message || 'Asistencia registrada con éxito.');
      fetchAsistencia();
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!evento) return null;

  const total = asistenciaData.totalAsistentes || 0;
  const capacidad = asistenciaData.capacidadMaxima || evento.espacio?.capacidad || 1;
  const cuposAgotados = capacidad > 0 && total >= capacidad;
  const yaAsistio = asistenciaData.asistioUsuarioActual;
  const porcentajeOcupacion = Math.min(100, Math.round((total / capacidad) * 100));

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { ...options, timeZone: 'UTC' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Código QR & Asistencia
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
              {evento.titulo}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {evento.espacio?.nombre} • {formatDate(evento.fecha)} ({evento.horaInicio} - {evento.horaFin})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-center flex-1">

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center">
            <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
              <QRCodeSVG
                value={qrUrl}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
              Escanea con tu teléfono o comparte el enlace
            </p>
          </div>

          {/* Direct Link and Copy Button */}
          <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
            <input
              type="text"
              readOnly
              value={qrUrl}
              className="bg-transparent text-slate-600 dark:text-slate-300 font-mono text-[11px] flex-1 px-2 focus:outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs transition-all shrink-0 flex items-center gap-1 active:scale-95"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          {/* Real-time Capacity / Attendance counter */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-500" />
                Asistencia en tiempo real:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {loading ? '...' : `${total} / ${capacidad}`}
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  cuposAgotados ? 'bg-rose-500' : porcentajeOcupacion > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${porcentajeOcupacion}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {porcentajeOcupacion}% de capacidad ocupada
              </span>
              {cuposAgotados ? (
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-md font-bold text-[11px]">
                  🚫 Cupos Agotados
                </span>
              ) : yaAsistio ? (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-md font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Registrado
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md font-medium text-[11px]">
                  Disponibles: {capacidad - total}
                </span>
              )}
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2 text-left">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2 text-left">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{message}</span>
            </div>
          )}

          {/* Confirmation Action Button */}
          <div className="pt-2">
            {!token ? (
              <button
                onClick={() => {
                  onClose();
                  if (onNavigate) onNavigate('login');
                }}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                Inicia sesión para confirmar asistencia
              </button>
            ) : yaAsistio ? (
              <div className="w-full py-2.5 px-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                ¡Tu asistencia ya está confirmada!
              </div>
            ) : cuposAgotados ? (
              <button
                disabled
                className="w-full py-2.5 px-4 bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed"
              >
                Cupos Agotados
              </button>
            ) : (
              <button
                onClick={handleConfirmarAsistencia}
                disabled={confirming}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                {confirming ? 'Registrando Asistencia...' : 'Confirmar Asistencia a este Evento'}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
