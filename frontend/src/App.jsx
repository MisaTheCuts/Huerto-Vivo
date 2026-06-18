import { useState } from 'react';
import Header             from './components/Header';
import BottomNav          from './components/BottomNav';
import { IcoUser } from './components/icons';
import Login              from './pages/Login';
import HomeAdmin          from './pages/HomeAdmin';
import HomeVecino         from './pages/HomeVecino';
import MiParcela          from './pages/MiParcela';
import RegistrarActividad from './pages/RegistrarActividad';
import Comunidad          from './pages/Comunidad';
import Notificaciones     from './pages/Notificaciones';
import Ajustes            from './pages/Ajustes';

export default function App() {
  const [usuario,       setUsuario]       = useState(null);
  const [tab,           setTab]           = useState('inicio');
  const [subPage,       setSubPage]       = useState(null);      // 'ajustes' | 'actividad' | null
  const [actividadTipo, setActividadTipo] = useState('riego');   // tab inicial al abrir RegistrarActividad

  const handleLogin = (user) => {
    setUsuario(user);
    setTab('inicio');
    setSubPage(null);
  };

  const handleLogout = () => {
    setUsuario(null);
    setTab('inicio');
    setSubPage(null);
    setActividadTipo('riego');
  };

  // destino: nombre de tab o 'ajustes' | 'actividad'
  // tipo: tab inicial para RegistrarActividad ('riego' | 'cosecha' | 'siembra' | 'problema')
  const handleNavChange = (destino, tipo) => {
    if (destino === 'ajustes') {
      setSubPage('ajustes');
      return;
    }
    if (destino === 'actividad') {
      setActividadTipo(tipo || 'riego');
      setSubPage('actividad');
      return;
    }
    setSubPage(null);
    setTab(destino);
  };

  // Sin sesión → Login
  if (!usuario) return <Login onLogin={handleLogin} />;

  // Sub-páginas (sin BottomNav visible cambiado)
  if (subPage === 'ajustes') {
    return (
      <div className="app-layout">
        <div className="header">
          <button
            onClick={() => setSubPage(null)}
            style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#388e3c', fontWeight: 700 }}
          >
            ← Ajustes
          </button>
          <span style={{ fontSize: '0.75rem', color: '#888' }}>Administra tu perfil y preferencias</span>
        </div>
        <Ajustes usuario={usuario} onLogout={handleLogout} />
        <BottomNav active={tab} onChange={handleNavChange} />
      </div>
    );
  }

  if (subPage === 'actividad') {
    return (
      <div className="app-layout">
        <div className="header">
          <button
            onClick={() => setSubPage(null)}
            style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#388e3c', fontWeight: 700 }}
          >
            ← Huerto Vivo
          </button>
          <span style={{ color: 'var(--texto-sec)', display: 'flex' }}><IcoUser size={20} /></span>
        </div>
        <RegistrarActividad usuario={usuario} onNavChange={handleNavChange} initialTab={actividadTipo} />
        <BottomNav active="parcela" onChange={handleNavChange} />
      </div>
    );
  }

  // Página activa por tab
  const renderPage = () => {
    switch (tab) {
      case 'inicio':
        return usuario.rol === 'admin'
          ? <HomeAdmin  usuario={usuario} onNavChange={handleNavChange} />
          : <HomeVecino usuario={usuario} onNavChange={handleNavChange} />;
      case 'parcela':
        return <MiParcela      usuario={usuario} onNavChange={handleNavChange} />;
      case 'comunidad':
        return <Comunidad      usuario={usuario} />;
      case 'alertas':
        return <Notificaciones usuario={usuario} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Header onSettings={() => handleNavChange('ajustes')} />
      {renderPage()}
      <BottomNav active={tab} onChange={handleNavChange} />
    </div>
  );
}
