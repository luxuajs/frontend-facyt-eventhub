import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import VerifyCode from './components/VerifyCode';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ConfirmInvite from './components/ConfirmInvite';
import CalendarView from './components/CalendarView';
import ReservationsList from './components/ReservationsList';
import NewReservationForm from './components/NewReservationForm';
import CoordinatorQueue from './components/CoordinatorQueue';
import CoordinatorManagement from './components/CoordinatorManagement';
import AuditLogs from './components/AuditLogs';
import EspaciosManagement from './components/EspaciosManagement';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('calendario');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  // Efecto para aplicar la clase dark
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Efecto para capturar rutas de invitación / recuperación por token en la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const path = window.location.pathname;

    if (tokenParam) {
      if (path === '/confirm-invite') {
        setInviteToken(tokenParam);
        setActiveTab('confirm-invite');
      } else if (path === '/reset-password') {
        setResetToken(tokenParam);
        setActiveTab('reset-password');
      }
    }
  }, []);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setActiveTab('calendario');
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setActiveTab('calendario');
  };

  const handleRegisterSuccess = (email) => {
    setVerifyEmail(email);
    setActiveTab('verify');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} onNavigate={setActiveTab} />;
      case 'register':
        return <Register onRegisterSuccess={handleRegisterSuccess} onNavigate={setActiveTab} />;
      case 'verify':
        return <VerifyCode email={verifyEmail} onNavigate={setActiveTab} />;
      case 'forgot-password':
        return <ForgotPassword onNavigate={setActiveTab} />;
      case 'reset-password':
        return <ResetPassword token={resetToken} onNavigate={setActiveTab} />;
      case 'confirm-invite':
        return <ConfirmInvite token={inviteToken} onNavigate={setActiveTab} />;
      case 'calendario':
        return <CalendarView token={token} />;
      case 'mis-reservas':
        return token ? <ReservationsList token={token} /> : <Login onLoginSuccess={handleLoginSuccess} onNavigate={setActiveTab} />;
      case 'nueva-reserva':
        return token ? (
          <NewReservationForm
            token={token}
            user={user}
            onReservationCreated={() => setActiveTab('mis-reservas')}
          />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} onNavigate={setActiveTab} />
        );
      case 'cola':
        return token && (user?.rol === 'COORDINADOR' || user?.rol === 'ROOT') ? (
          <CoordinatorQueue token={token} />
        ) : (
          <div className="text-center py-12 text-slate-500">Acceso denegado.</div>
        );
      case 'espacios':
        return token && (user?.rol === 'COORDINADOR' || user?.rol === 'ROOT') ? (
          <EspaciosManagement user={user} token={token} />
        ) : (
          <div className="text-center py-12 text-slate-500">Acceso denegado.</div>
        );
      case 'invitar-coordinador':
        return token && user?.rol === 'ROOT' ? (
          <CoordinatorManagement token={token} />
        ) : (
          <div className="text-center py-12 text-slate-500">Acceso denegado.</div>
        );
      case 'auditoria':
        return token && user?.rol === 'ROOT' ? (
          <AuditLogs token={token} />
        ) : (
          <div className="text-center py-12 text-slate-500">Acceso denegado.</div>
        );
      default:
        return <CalendarView token={token} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-150 font-sans">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="fade-in">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-905 border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Universidad de Carabobo | Facultad Experimental de Ciencias y Tecnología (FaCyT)</p>
          <p className="mt-1 font-mono text-[10px] text-slate-400 dark:text-slate-500">FaCyT EventHub - Construido para la excelencia académica</p>
        </div>
      </footer>

    </div>
  );
}
