import { useState } from 'react';
import { api } from '../api';
import { IcoLeaf, IcoMail, IcoLock, IcoUser, IcoUsers } from '../components/icons';

export default function Login({ onLogin }) {
  const [correo,     setCorreo]     = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(correo, contrasena);
      if (data.error) setError(data.error);
      else onLogin(data.usuario);
    } catch {
      setError('No se pudo conectar al servidor. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const accesoRapido = async (tipo) => {
    const creds = tipo === 'admin'
      ? { correo: 'carmen@huertovivo.cl',  contrasena: 'admin123'  }
      : { correo: 'juan@huertovivo.cl',    contrasena: 'vecino123' };
    setError('');
    setLoading(true);
    try {
      const data = await api.login(creds.correo, creds.contrasena);
      if (data.error) setError(data.error);
      else onLogin(data.usuario);
    } catch {
      setError('No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-logo-wrap">
        <IcoLeaf size={34} />
      </div>
      <h1 className="login-title">Huerto Vivo</h1>
      <p className="login-sub">
        Organiza tu huerto comunitario<br />en un solo lugar
      </p>

      <form onSubmit={handleLogin} style={{ width: '100%' }}>
        <div className="form-group">
          <div className="input-icon">
            <span className="icon"><IcoMail size={17} /></span>
            <input
              className="input"
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="input-icon">
            <span className="icon"><IcoLock size={17} /></span>
            <input
              className="input"
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="btn btn-primary mt-12" type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="login-divider">Acceso rápido — prototipo</div>

      <button
        className="login-quick-btn"
        onClick={() => accesoRapido('admin')}
        disabled={loading}
      >
        <div className="login-quick-icon"><IcoUser size={18} /></div>
        <div>
          <span className="login-quick-label">Coordinadora</span>
          <span className="login-quick-sub">carmen@huertovivo.cl · admin123</span>
        </div>
      </button>

      <button
        className="login-quick-btn"
        onClick={() => accesoRapido('vecino')}
        disabled={loading}
      >
        <div className="login-quick-icon"><IcoUsers size={18} /></div>
        <div>
          <span className="login-quick-label">Vecino</span>
          <span className="login-quick-sub">juan@huertovivo.cl · vecino123</span>
        </div>
      </button>

      <p className="login-footer">Cuidemos juntos nuestro huerto</p>
    </div>
  );
}
