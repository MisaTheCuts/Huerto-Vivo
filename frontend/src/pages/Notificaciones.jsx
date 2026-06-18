import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { api } from '../api';
import { IcoAlert, IcoLeaf, IcoClock, IcoEdit } from '../components/icons';

const ICONO_TIPO = {
  alerta:       { Icon: IcoAlert, clase: 'notif-alerta' },
  info:         { Icon: IcoLeaf,  clase: 'notif-info' },
  recordatorio: { Icon: IcoClock, clase: 'notif-record' },
  reporte:      { Icon: IcoEdit,  clase: 'notif-reporte' },
};

function formatFecha(fechaStr) {
  const d = new Date(fechaStr);
  const hoy = new Date();
  const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
  if (d.toDateString() === hoy.toDateString()) return 'Hoy';
  if (d.toDateString() === ayer.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es-CL', { weekday: 'short' });
}

export default function Notificaciones({ usuario }) {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNotificaciones(usuario.id_usuario)
      .then(setNotifs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [usuario]);

  const marcarLeida = async (id) => {
    await api.marcarLeida(id).catch(() => {});
    setNotifs(prev => prev.map(n => n.id_notificacion === id ? { ...n, leida: 1 } : n));
  };

  const marcarTodas = async () => {
    const noLeidas = notifs.filter(n => !n.leida);
    await Promise.all(noLeidas.map(n => api.marcarLeida(n.id_notificacion)));
    setNotifs(prev => prev.map(n => ({ ...n, leida: 1 })));
  };

  const hoy  = notifs.filter(n => formatFecha(n.fecha_envio) === 'Hoy');
  const prev = notifs.filter(n => formatFecha(n.fecha_envio) !== 'Hoy');

  const NotifItem = ({ n }) => {
    const t = ICONO_TIPO[n.tipo] || ICONO_TIPO.info;
    return (
      <div
        className={`notif-item ${!n.leida ? 'no-leida' : ''}`}
        onClick={() => !n.leida && marcarLeida(n.id_notificacion)}
      >
        <div className={`notif-icono ${t.clase}`}><t.Icon size={16} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="notif-texto" style={{ fontSize: '0.88rem', marginBottom: 2 }}>
            {n.titulo}
          </p>
          <p style={{ fontSize: '0.78rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {n.mensaje}
          </p>
        </div>
        <span className="notif-hora">{formatFecha(n.fecha_envio)}</span>
      </div>
    );
  };

  return (
    <div className="screen p-16">
      <div className="flex-between mb-12">
        <h2 className="page-title" style={{ marginBottom: 0 }}>Notificaciones</h2>
        {notifs.some(n => !n.leida) && (
          <button
            style={{ background: 'none', border: 'none', color: '#388e3c', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
            onClick={marcarTodas}
          >
            Marcar todas leídas
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gris">Cargando...</p>
      ) : (
        <>
          {hoy.length > 0 && (
            <>
              <p className="section-title">Hoy</p>
              <Card>
                {hoy.map(n => <NotifItem key={n.id_notificacion} n={n} />)}
              </Card>
            </>
          )}

          {prev.length > 0 && (
            <>
              <p className="section-title">Anteriores</p>
              <Card>
                {prev.map(n => <NotifItem key={n.id_notificacion} n={n} />)}
              </Card>
            </>
          )}

          {notifs.length === 0 && (
            <Card>
              <p className="text-gris" style={{ textAlign: 'center', padding: '16px 0' }}>
                No tienes notificaciones.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
