import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export default function ModalAlert({ isOpen, onClose, title = 'Atención', message, type = 'error' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon & Content */}
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-xl shrink-0 ${
            isError 
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' 
              : isSuccess 
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
              : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
          }`}>
            {isError && <AlertTriangle className="h-6 w-6" />}
            {isSuccess && <CheckCircle className="h-6 w-6" />}
            {!isError && !isSuccess && <Info className="h-6 w-6" />}
          </div>

          <div className="space-y-1 pr-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-[0.98] shadow-sm ${
              isError
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : isSuccess
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
