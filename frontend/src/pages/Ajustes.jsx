import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { api } from '../api';
import { IcoUser, IcoBell, IcoLeaf, IcoSettings, IcoLogOut, IcoChevronRight } from '../components/icons';

// ---- Modal genérico ----
function Modal({ titulo, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{titulo}</span>
          <button className="modal-close" onClick={onClose} title="Cerrar">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---- Panel: Mi perfil ----
function PanelPerfil({ usuario }) {
  return (
    <>
      <div className="modal-row">
        <label>Nombre</label>
        <span>{usuario.nombre}</span>
      </div>
      <div className="modal-row">
        <label>Correo</label>
        <span style={{ fontSize: '0.82rem' }}>{usuario.correo}</span>
      </div>
      <div className="modal-row">
        <label>Rol</label>
        <span>{usuario.rol === 'admin' ? 'Coordinadora' : 'Vecino'}</span>
      </div>
      <div className="modal-row">
        <label>Teléfono</label>
        <span>{usuario.telefono || '—'}</span>
      </div>
      <div className="modal-nota">
        Edición de perfil disponible en próxima versión.
      </div>
    </>
  );
}

// ---- Panel: Notificaciones ----
const ALERTAS = [
  { key: 'riego',   label: 'Alertas de riego' },
  { key: 'avisos',  label: 'Avisos comunitarios' },
  { key: 'cosecha', label: 'Recordatorios de cosecha' },
];

function PanelNotificaciones() {
  const [estados, setEstados] = useState({ riego: true, avisos: true, cosecha: true });

  const toggle = (key) => setEstados(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      {ALERTAS.map(a => (
        <div key={a.key} className="toggle-row">
          <span>{a.label}</span>
          <button
            className={`toggle-switch ${estados[a.key] ? 'on' : 'off'}`}
            onClick={() => toggle(a.key)}
            title={estados[a.key] ? 'Desactivar' : 'Activar'}
          />
        </div>
      ))}
      <div className="modal-nota">
        Configuración demostrativa. Los cambios no se guardan en el servidor.
      </div>
    </>
  );
}

// ---- Panel: Mi parcela ----
function PanelParcela({ usuario }) {
  const [parcela, setParcela] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getParcelas()
      .then(data => setParcela(data.find(p => p.vecino === usuario.nombre) || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [usuario.nombre]);

  if (loading) return <p style={{ color: '#888', fontSize: '0.88rem', padding: '8px 0' }}>Cargando...</p>;

  if (!parcela) return (
    <p style={{ color: '#888', fontSize: '0.88rem', padding: '8px 0' }}>
      No tienes una parcela asignada.
    </p>
  );

  return (
    <>
      <div className="modal-row">
        <label>Parcela</label>
        <span>{parcela.numero}</span>
      </div>
      <div className="modal-row">
        <label>Ubicación</label>
        <span style={{ fontSize: '0.82rem' }}>{parcela.descripcion || '—'}</span>
      </div>
      <div className="modal-row">
        <label>Responsable</label>
        <span>{parcela.vecino || '—'}</span>
      </div>
      <div className="modal-row">
        <label>Tamaño</label>
        <span>{parcela.tamanio_m2 ? `${parcela.tamanio_m2} m²` : '—'}</span>
      </div>
      <div className="modal-row">
        <label>Estado</label>
        <span style={{ color: '#388e3c' }}>● {parcela.estado}</span>
      </div>
      <div className="modal-nota">
        Para modificar la parcela asignada, contactar a la coordinadora.
      </div>
    </>
  );
}

// ---- Panel: Gestión del huerto (solo admin) ----
function PanelGestion() {
  return (
    <>
      <p style={{ fontSize: '0.88rem', color: '#555', lineHeight: 1.6, marginBottom: 12 }}>
        Desde este panel podrás administrar los recursos del huerto comunitario.
      </p>
      <div className="modal-row">
        <label>Parcelas</label>
        <span>Gestión de espacios</span>
      </div>
      <div className="modal-row">
        <label>Turnos</label>
        <span>Planificación de riego</span>
      </div>
      <div className="modal-row">
        <label>Vecinos</label>
        <span>Registro de participantes</span>
      </div>
      <div className="modal-nota" style={{ background: 'var(--naranja-bg)', color: 'var(--naranja)' }}>
        Panel administrativo completo disponible en próxima versión.
      </div>
    </>
  );
}

// ---- Ajustes principal ----
export default function Ajustes({ usuario, onLogout }) {
  const [panelAbierto, setPanelAbierto] = useState(null);

  const esAdmin = usuario.rol === 'admin';

  const menuItems = [
    { key: 'perfil',         Icon: IcoUser,     titulo: 'Mi perfil',          sub: 'Ver datos personales',           bg: 'var(--g3)',        color: 'var(--g1)' },
    { key: 'notificaciones', Icon: IcoBell,     titulo: 'Notificaciones',      sub: 'Configurar alertas',             bg: 'var(--amarillo-bg)', color: 'var(--amarillo)' },
    { key: 'parcela',        Icon: IcoLeaf,     titulo: 'Mi parcela',          sub: 'Ver parcela asignada',           bg: 'var(--g3)',        color: 'var(--g1)' },
    ...(esAdmin
      ? [{ key: 'gestion', Icon: IcoSettings, titulo: 'Gestión del huerto', sub: 'Administrar parcelas y turnos', bg: '#e3f2fd', color: '#1565c0' }]
      : []
    ),
  ];

  const titulosModal = {
    perfil:         'Mi perfil',
    notificaciones: 'Notificaciones',
    parcela:        'Mi parcela',
    gestion:        'Gestión del huerto',
  };

  const renderPanel = () => {
    switch (panelAbierto) {
      case 'perfil':         return <PanelPerfil         usuario={usuario} />;
      case 'notificaciones': return <PanelNotificaciones />;
      case 'parcela':        return <PanelParcela        usuario={usuario} />;
      case 'gestion':        return <PanelGestion />;
      default:               return null;
    }
  };

  return (
    <div className="screen p-16">

      {/* Modal — se superpone cuando hay un panel abierto */}
      {panelAbierto && (
        <Modal
          titulo={titulosModal[panelAbierto]}
          onClose={() => setPanelAbierto(null)}
        >
          {renderPanel()}
        </Modal>
      )}

      {/* Avatar y datos del usuario */}
      <Card style={{ textAlign: 'center', paddingTop: 24, paddingBottom: 24 }}>
        <div style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #388e3c, #81c784)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', margin: '0 auto 12px',
          color: '#fff', fontWeight: 700,
        }}>
          {usuario.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
        </div>
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{usuario.nombre}</h3>
        <p style={{ color: '#888', fontSize: '0.82rem', marginTop: 4 }}>
          {esAdmin ? 'Coordinadora' : 'Vecino'} · {usuario.correo}
        </p>
      </Card>

      {/* Menú de opciones */}
      <Card>
        {menuItems.map((item) => (
          <div
            key={item.key}
            className="settings-item"
            onClick={() => setPanelAbierto(item.key)}
          >
            <div className="settings-left">
              <div className="settings-icon" style={{ background: item.bg, color: item.color }}>
                <item.Icon size={18} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.titulo}</p>
                <p style={{ fontSize: '0.76rem', color: 'var(--texto-sec)' }}>{item.sub}</p>
              </div>
            </div>
            <IcoChevronRight size={16} style={{ color: 'var(--borde)' }} />
          </div>
        ))}
      </Card>

      {/* Cerrar sesión */}
      <button
        onClick={onLogout}
        style={{
          width: '100%',
          background: 'var(--blanco)',
          border: 'none',
          borderRadius: 12,
          boxShadow: 'var(--sombra)',
          padding: 16,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: 'var(--rojo)',
          marginBottom: 12,
        }}
      >
        <div className="settings-icon" style={{ background: 'var(--rojo-bg)', color: 'var(--rojo)' }}>
          <IcoLogOut size={18} />
        </div>
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Cerrar sesión</span>
      </button>
    </div>
  );
}
