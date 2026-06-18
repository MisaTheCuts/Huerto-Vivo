import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { api } from '../api';
import { PARCELA_DISPLAY, CULTIVO_PRINCIPAL } from '../huerto';
import { IcoDrop, IcoClock, IcoCheck, IcoLeaf, IcoBell, IcoCalendar } from '../components/icons';

export default function HomeVecino({ usuario, onNavChange }) {
  const [turnos,     setTurnos]     = useState([]);
  const [parcela,    setParcela]    = useState(null);
  const [notifs,     setNotifs]     = useState([]);
  const [confirmMsg, setConfirmMsg] = useState('');

  useEffect(() => {
    api.getTurnos().then(data => {
      const misTurnos = data.filter(t => t.vecino === usuario.nombre);
      setTurnos(misTurnos);
    }).catch(() => {});

    api.getParcelas().then(data => {
      const miParcela = data.find(p => p.vecino === usuario.nombre);
      setParcela(miParcela || null);
    }).catch(() => {});

    api.getNotificaciones(usuario.id_usuario).then(setNotifs).catch(() => {});
  }, [usuario]);

  const hoy = new Date().toISOString().split('T')[0];
  const turnoHoy = turnos.find(t => t.fecha?.startsWith(hoy) && !t.completado);

  // Número correcto de parcela según el caso (independiente del estado de la BD)
  const numParcela     = PARCELA_DISPLAY[usuario.nombre] || parcela?.numero;
  const cultivoPrincipal = CULTIVO_PRINCIPAL[numParcela] || '—';

  const marcarCumplido = async () => {
    if (!turnoHoy) return;
    try {
      await api.cumplirTurno(turnoHoy.id_turno);
      setConfirmMsg('¡Riego marcado como cumplido!');
      setTurnos(prev => prev.map(t =>
        t.id_turno === turnoHoy.id_turno ? { ...t, completado: 1 } : t
      ));
    } catch {
      setConfirmMsg('Error al actualizar el turno.');
    }
  };

  const notifsRecientes = notifs.slice(0, 2);

  return (
    <div className="screen p-16">
      {/* Saludo */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 2 }}>
        ¡Hola, {usuario.nombre.split(' ')[0]}!
      </h2>
      <p className="text-gris" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
        Tus tareas del huerto para hoy
      </p>

      {/* Tarea de hoy */}
      <Card>
        <div className="flex-between mb-8">
          <div className="flex gap-8" style={{ alignItems: 'center' }}>
            <span style={{ color: 'var(--g1)', display: 'flex' }}><IcoDrop size={18} /></span>
            <span style={{ fontWeight: 600 }}>Mi tarea de hoy</span>
          </div>
          <span className={`badge ${turnoHoy ? 'badge-pending' : 'badge-green'}`}>
            {turnoHoy ? 'Pendiente' : 'Completado'}
          </span>
        </div>
        {turnoHoy ? (
          <>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>
              Parcela {numParcela || turnoHoy.parcela}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--texto-sec)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IcoDrop size={14} />Actividad: Riego programado
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--texto-sec)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IcoClock size={14} />Hora: {turnoHoy.hora_inicio?.slice(0,5)}
            </p>
            <button className="btn btn-primary btn-sm" onClick={marcarCumplido} style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <IcoCheck size={15} />Marcar riego cumplido
            </button>
          </>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--texto-sec)' }}>
            No tienes turnos pendientes hoy.
          </p>
        )}
        {confirmMsg && <p className="success-msg mt-8">{confirmMsg}</p>}
      </Card>

      {/* Estado de mi parcela */}
      {parcela && (
        <Card>
          <div
            style={{
              borderRadius: 10,
              background: 'linear-gradient(135deg, #388e3c 0%, #81c784 100%)',
              color: '#fff',
              padding: '12px 14px',
              marginBottom: 12,
              fontWeight: 700,
              fontSize: '0.95rem',
            }}
          >
            Estado de mi parcela
          </div>
          <div className="info-grid">
            <div className="info-cell">
              <label>Cultivo principal</label>
              <span>{cultivoPrincipal}</span>
            </div>
            <div className="info-cell">
              <label>Estado</label>
              <span style={{ color: '#388e3c' }}>● Saludable</span>
            </div>
            <div className="info-cell">
              <label>Parcela</label>
              <span>{numParcela}</span>
            </div>
            <div className="info-cell">
              <label>Tamaño</label>
              <span>{parcela.tamanio_m2} m²</span>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => onNavChange('parcela')} style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <IcoLeaf size={14} />Ver mi parcela
          </button>
        </Card>
      )}

      {/* Avisos de la comunidad */}
      {notifsRecientes.length > 0 && (
        <Card>
          <p style={{ fontWeight: 700, marginBottom: 10 }}>Avisos de la comunidad</p>
          {notifsRecientes.map(n => (
            <div key={n.id_notificacion} className="list-item">
              <div className="flex gap-8" style={{ alignItems: 'center' }}>
                <span style={{ color: n.tipo === 'alerta' ? 'var(--rojo)' : 'var(--g1)', display: 'flex' }}>
                  {n.tipo === 'alerta' ? <IcoBell size={15} /> : <IcoCalendar size={15} />}
                </span>
                <span style={{ fontSize: '0.85rem' }}>{n.titulo}</span>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
