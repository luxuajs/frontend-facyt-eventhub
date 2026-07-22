import React from 'react';
import { Sun, Moon, LogOut, Calendar, User, ShieldAlert, Award } from 'lucide-react';

export default function Navbar({ user, activeTab, setActiveTab, onLogout, darkMode, setDarkMode }) {
  const isRoot = user?.rol === 'ROOT';
  const isCoordinador = user?.rol === 'COORDINADOR' || isRoot;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('calendario')}>
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all">
            F
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center">
              FaCyT <span className="text-blue-500 dark:text-blue-400 ml-1 font-semibold text-xs px-1.5 py-0.5 rounded border border-blue-500/30 font-mono">EventHub</span>
            </h1>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Universidad de Carabobo</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex space-x-1">
          <button
            onClick={() => setActiveTab('calendario')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'calendario'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Calendario
          </button>

          {user && (
            <>
              <button
                onClick={() => setActiveTab('mis-reservas')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'mis-reservas'
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <User className="h-4 w-4" />
                Mis Reservas
              </button>

              <button
                onClick={() => setActiveTab('nueva-reserva')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'nueva-reserva'
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                Solicitar Reserva
              </button>
            </>
          )}

          {isCoordinador && (
            <button
              onClick={() => setActiveTab('cola')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'cola'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Award className="h-4 w-4" />
              Cola Coordinación
            </button>
          )}

          {isRoot && (
            <>
              <button
                onClick={() => setActiveTab('invitar-coordinador')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'invitar-coordinador'
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                Coordinadores
              </button>

              <button
                onClick={() => setActiveTab('auditoria')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'auditoria'
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                Auditoría
              </button>
            </>
          )}
        </nav>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-3">
          
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
            title="Cambiar Tema"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{user.nombre}</p>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{user.rol}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('login')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98]"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile Submenu tabs */}
      {user && (
        <div className="md:hidden flex justify-around border-t border-slate-200 dark:border-slate-800 py-2 bg-slate-50 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveTab('calendario')}
            className={`px-2 py-1 text-xs font-semibold rounded ${
              activeTab === 'calendario' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            Calendario
          </button>
          <button
            onClick={() => setActiveTab('mis-reservas')}
            className={`px-2 py-1 text-xs font-semibold rounded ${
              activeTab === 'mis-reservas' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            Reservas
          </button>
          <button
            onClick={() => setActiveTab('nueva-reserva')}
            className={`px-2 py-1 text-xs font-semibold rounded ${
              activeTab === 'nueva-reserva' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            Nueva
          </button>
          {isCoordinador && (
            <button
              onClick={() => setActiveTab('cola')}
              className={`px-2 py-1 text-xs font-semibold rounded ${
                activeTab === 'cola' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
              }`}
            >
              Cola
            </button>
          )}
        </div>
      )}
    </header>
  );
}
