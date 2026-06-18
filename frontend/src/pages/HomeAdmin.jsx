import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { api } from '../api';
import { IcoAlert, IcoCheckCircle, IcoChevronRight } from '../components/icons';

// ---- helpers ----

// Normaliza fecha de MySQL (DATE puede venir como string 'YYYY-MM-DD' o con sufijo T...)
function fn(valor) {
  return String(valor).split('T')[0];
}

function estadoTurno(t, hoy) {
  if (t.completado)      return { label: 'Cumplido',  clase: 'badge-green'   };
  if (fn(t.fecha) < hoy) return { label: 'Atrasado',  clase: 'badge-red'     };
  return                        { label: 'Pendiente', clase: 'badge-pending'  };
}

function hace30dias() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

// ---- constantes de comunidad (espejo de Comunidad.jsx) ----
// Los 9 vecinos extra viven solo en frontend; el total real del caso es 18.
const TOTAL_VECINOS = 18;

// Mapa vecino → número de parcela según el orden acordado en el caso.
// Se usa para la visualización en el dashboard; los datos reales de la BD
// aún pueden tener el orden antiguo si no se ejecutó la migración SQL.
const PARCELA_DISPLAY = {
  'Carmen López':   'P-01',
  'Juan Contreras': 'P-02',
  'María González': 'P-03',
  'Pedro Ramírez':  'P-04',
  'Ana Flores':     'P-05',
  'Luis Herrera':   'P-06',
  'Rosa Muñoz':     'P-07',
  'Carlos Vega':    'P-08',
  'Sofía Torres':   'P-09',
};

// Devuelve el número de parcela correcto para un turno
function parcelaTurno(t) {
  return PARCELA_DISPLAY[t.vecino] || t.parcela;
}

// ---- componente principal ----
export default function HomeAdmin({ usuario, onNavChange }) {
  const [parcelas,    setParcelas]    = useState([]);
  const [turnos,      setTurnos]      = useState([]);
  const [usuarios,    setUsuarios]    = useState([]);
  const [cosechas,    setCosechas]    = useState([]);
  const [actividades, setActividades] = useState([]);
  const [mensajeDemo, setMensajeDemo] = useState('');
  const [loadingDemo, setLoadingDemo] = useState(false);

  const cargarTurnos = () => api.getTurnos().then(setTurnos).catch(() => {});

  useEffect(() => {
    api.getParcelas().then(setParcelas).catch(() => {});
    cargarTurnos();
    api.getUsuarios().then(setUsuarios).catch(() => {});
    api.getCosechas().then(setCosechas).catch(() => {});
    api.getActividades().then(setActividades).catch(() => {});
  }, []);

  const handleReiniciarDemo = async () => {
    setLoadingDemo(true);
    setMensajeDemo('');
    try {
      const res = await api.reiniciarDemo();
      await cargarTurnos();
      setMensajeDemo(res.error ? `Error: ${res.error}` : 'Turnos del día reiniciados correctamente.');
    } catch {
      setMensajeDemo('Error al conectar con el servidor.');
    } finally {
      setLoadingDemo(false);
      setTimeout(() => setMensajeDemo(''), 5000);
    }
  };

  const hoy = new Date().toISOString().split('T')[0];

  // ── turnos de hoy ──
  const turnosHoy = turnos.filter(t => t.fecha?.startsWith(hoy));

  // ── alertas urgentes ──
  const turnosPendientesHoy = turnosHoy.filter(t => !t.completado);
  const turnosAtrasados     = turnos.filter(t => !t.completado && fn(t.fecha) < hoy);

  // ── stats de parcelas (solo HOY — mismo universo que la lista de detalle) ──
  const regadasHoy         = turnosHoy.filter(t => t.completado).length;
  const pendientesRiegoHoy = turnosPendientesHoy.length;
  const sinRiegoProgramado = TOTAL_VECINOS - turnosHoy.length;

  // ── lista de detalle: solo turnos de HOY, pendientes primero por hora ──
  const turnosDeHoy = [
    ...turnosPendientesHoy.sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || '')),
    ...turnosHoy.filter(t => t.completado).sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || '')),
  ];

  // ── cosechas agrupadas por cultivo ──
  const cosechasPorCultivo = cosechas.reduce((acc, c) => {
    const nombre = c.cultivo || 'Otro';
    acc[nombre] = (acc[nombre] || 0) + parseFloat(c.cantidad_kg || 0);
    return acc;
  }, {});
  const totalKg        = Object.values(cosechasPorCultivo).reduce((a, b) => a + b, 0);
  const vecinosConCosecha = [...new Set(cosechas.map(c => c.usuario))].length;
  const itemsCosecha   = Object.entries(cosechasPorCultivo)
    .sort(([, a], [, b]) => b - a);

  // ── participación vecinal (últimos 30 días) ──
  const limite = hace30dias();
  const actividadesRecientes = actividades.filter(a => {
    const fecha = typeof a.fecha === 'string' ? a.fecha.slice(0, 10) : '';
    return fecha >= limite;
  });
  const actPorVecino = actividadesRecientes.reduce((acc, a) => {
    if (a.usuario) acc[a.usuario] = (acc[a.usuario] || 0) + 1;
    return acc;
  }, {});
  const rankingVecinos = Object.entries(actPorVecino)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const turnosCumplidos = turnos.filter(t => t.completado).length;
  const vecnosConAtraso = [...new Set(turnosAtrasados.map(t => t.vecino))];

  return (
    <div className="screen p-16">

      {/* ── Saludo ── */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 2 }}>
        ¡Hola, Doña Carmen!
      </h2>
      <p className="text-gris" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
        Resumen del huerto para hoy
      </p>

      {/* ── 1. Estado general ── */}
      <Card>
        <div className="flex-between mb-8">
          <span style={{ fontWeight: 700 }}>Estado general del huerto</span>
          <span className="badge badge-orange">Requiere atención</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
          {[
            { n: TOTAL_VECINOS,       label: 'Total de parcelas',    color: '#1b5e20', bg: '#e8f5e9' },
            { n: regadasHoy,          label: 'Regadas hoy',          color: '#2e7d32', bg: '#c8e6c9' },
            { n: pendientesRiegoHoy,  label: 'Pendientes de riego',  color: '#e65100', bg: '#fff3e0' },
            { n: sinRiegoProgramado,  label: 'Sin riego programado', color: '#757575', bg: '#f5f5f5' },
          ].map(({ n, label, color, bg }) => (
            <div key={label} style={{
              background: bg, borderRadius: 10,
              padding: '10px 12px', textAlign: 'center',
            }}>
              <span style={{ fontWeight: 800, fontSize: '1.5rem', color, display: 'block', lineHeight: 1.2 }}>{n}</span>
              <span style={{ fontSize: '0.68rem', color, opacity: 0.85, lineHeight: 1.3, display: 'block', marginTop: 2 }}>{label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 2. Urgente hoy ── */}
      <p className="section-title" style={{ marginTop: 4 }}>Urgente hoy</p>

      {/* Atrasados = alerta roja; si no hay, confirmar que todo está bajo control */}
      {turnosAtrasados.length > 0 ? (
        turnosAtrasados.slice(0, 3).map(t => (
          <div key={t.id_turno} className="alert-item alert-riego">
            <span className="alert-ico"><IcoAlert size={14} /></span>
            <span>Turno atrasado — {t.vecino} ({parcelaTurno(t)})</span>
          </div>
        ))
      ) : (
        <div className="alert-item alert-siembra">
          <span className="alert-ico"><IcoCheckCircle size={14} /></span>
          <span>Sin alertas urgentes para hoy</span>
        </div>
      )}

      {/* Pendientes de hoy = advertencia amarilla */}
      {turnosPendientesHoy.slice(0, 3).map(t => (
        <div key={t.id_turno} className="alert-item alert-warning" style={{ marginBottom: 0 }}>
          <span className="alert-ico"><IcoAlert size={14} /></span>
          <span>{t.vecino} tiene turno de riego pendiente hoy ({parcelaTurno(t)})</span>
        </div>
      ))}

      {/* ── 3. Turnos de riego ── prioridad: Atrasados → Pendientes hoy → Cumplidos hoy → Futuros */}
      <Card style={{ marginTop: 12 }}>

        {/* encabezado */}
        <div className="flex-between mb-8">
          <div>
            <p style={{ fontWeight: 700 }}>Turnos de riego</p>
            <p style={{ fontSize: '0.72rem', color: '#888', marginTop: 2 }}>
              Parcelas con riego programado para hoy
            </p>
          </div>
          <button
            onClick={handleReiniciarDemo}
            disabled={loadingDemo}
            style={{
              fontSize: '0.7rem', fontWeight: 600,
              padding: '4px 10px', borderRadius: 8,
              border: '1px solid #bdbdbd',
              background: loadingDemo ? '#f5f5f5' : '#fff',
              color: '#757575', cursor: loadingDemo ? 'default' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {loadingDemo ? 'Reiniciando…' : 'Reiniciar demo'}
          </button>
        </div>

        {mensajeDemo && (
          <p style={{
            fontSize: '0.78rem', color: '#1b5e20',
            background: '#e8f5e9', borderRadius: 8,
            padding: '8px 12px', marginBottom: 10,
          }}>
            {mensajeDemo}
          </p>
        )}

        {/* lista de detalle — solo parcelas programadas hoy */}
        {turnosHoy.length === 0 ? (
          <p style={{
            fontSize: '0.85rem', color: '#757575',
            background: '#f5f5f5', borderRadius: 8,
            padding: '10px 12px', textAlign: 'center',
          }}>
            No hay riego programado para hoy.
          </p>
        ) : (
          turnosDeHoy.map(t => {
            const { label, clase } = estadoTurno(t, hoy);
            return (
              <div key={t.id_turno} className="list-item">
                <p style={{ fontSize: '0.86rem', flex: 1, color: '#212121' }}>
                  <span style={{ fontWeight: 700 }}>{parcelaTurno(t)}</span>
                  {' — '}{t.vecino}
                  {' — '}{t.hora_inicio?.slice(0, 5) || '—'}
                </p>
                <span className={`badge ${clase}`}>{label}</span>
              </div>
            );
          })
        )}
      </Card>

      {/* ── 4. Cosecha del mes ── responde: ¿cuánto se cosechó y cómo se reparte? */}
      <Card>
        {/* encabezado */}
        <div className="flex-between mb-8">
          <div>
            <p style={{ fontWeight: 700 }}>Cosecha del mes</p>
            <p style={{ fontSize: '0.72rem', color: '#888', marginTop: 2 }}>
              Resumen de cosechas registradas en el sistema
            </p>
          </div>
          <span className="badge badge-green">{totalKg.toFixed(1)} kg</span>
        </div>

        {/* lista por cultivo */}
        {itemsCosecha.length === 0 ? (
          <p className="text-gris" style={{ fontSize: '0.85rem' }}>Sin cosechas registradas.</p>
        ) : (
          <>
            {itemsCosecha.map(([cultivo, kg]) => (
              <div key={cultivo} className="list-item">
                <span style={{ fontSize: '0.88rem', color: '#424242' }}>{cultivo}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 60, height: 6, borderRadius: 3,
                    background: '#e0e0e0', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${Math.round((kg / totalKg) * 100)}%`,
                      height: '100%', background: '#388e3c', borderRadius: 3,
                    }} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', minWidth: 42, textAlign: 'right' }}>
                    {kg.toFixed(2)} kg
                  </span>
                </div>
              </div>
            ))}
            <div style={{
              marginTop: 10, paddingTop: 10,
              borderTop: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'space-between',
              fontSize: '0.8rem', color: '#888',
            }}>
              <span>{vecinosConCosecha} vecino{vecinosConCosecha !== 1 ? 's' : ''} con cosechas</span>
              <span>{cosechas.length} registro{cosechas.length !== 1 ? 's' : ''}</span>
            </div>
          </>
        )}

        {/* subsección: reparto de cosecha */}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #e8f5e9' }}>
          <p style={{
            fontSize: '0.75rem', fontWeight: 700, color: '#555',
            textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10,
          }}>
            Reparto de cosecha
          </p>

          {[
            { label: 'Repartido entre vecinos', kg: 4.5,  color: '#388e3c', bg: '#e8f5e9' },
            { label: 'Reserva comunitaria',      kg: 1.2,  color: '#1565c0', bg: '#e3f2fd' },
            { label: 'Pendiente de reparto',     kg: 0.6,  color: '#e65100', bg: '#fff3e0' },
          ].map(({ label, kg, color, bg }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #f5f5f5',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: color, flexShrink: 0,
                }} />
                <span style={{ fontSize: '0.85rem', color: '#424242' }}>{label}</span>
              </div>
              <span style={{
                fontSize: '0.85rem', fontWeight: 700,
                background: bg, color: color,
                padding: '2px 8px', borderRadius: 10,
              }}>
                {kg.toFixed(1)} kg
              </span>
            </div>
          ))}

          <p style={{
            fontSize: '0.73rem', color: '#9e9e9e',
            marginTop: 10, lineHeight: 1.5,
          }}>
            La distribución se realiza de forma equitativa entre los vecinos participantes.
          </p>
        </div>
      </Card>

      {/* ── 5. Participación vecinal ── responde: ¿quiénes son más activos y quiénes tienen atrasos? */}
      <Card>
        <div className="mb-8">
          <p style={{ fontWeight: 700 }}>Participación vecinal</p>
          <p style={{ fontSize: '0.72rem', color: '#888', marginTop: 2 }}>
            Control de cumplimiento comunitario · últimos 30 días
          </p>
        </div>

        {/* ranking de actividad */}
        {rankingVecinos.length > 0 ? (
          <>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Más activos
            </p>
            {rankingVecinos.map(([nombre, count], i) => (
              <div key={nombre} className="list-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: i === 0 ? '#388e3c' : '#e0e0e0',
                    color: i === 0 ? '#fff' : '#555',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: i === 0 ? 700 : 400 }}>{nombre}</span>
                </div>
                <span style={{ fontSize: '0.82rem', color: '#555' }}>
                  {count} actividad{count !== 1 ? 'es' : ''}
                </span>
              </div>
            ))}
          </>
        ) : (
          <p className="text-gris" style={{ fontSize: '0.85rem' }}>Sin actividades registradas recientemente.</p>
        )}

        {/* turnos cumplidos */}
        <div style={{
          marginTop: 10, padding: '10px 0',
          borderTop: '1px solid #f0f0f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.82rem', color: '#555' }}>Turnos cumplidos</span>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#388e3c' }}>
            {turnosCumplidos} / {turnos.length}
          </span>
        </div>

        {/* vecinos con atrasos */}
        {vecnosConAtraso.length > 0 && (
          <div style={{
            padding: '8px 10px', marginTop: 6,
            background: '#ffebee', borderRadius: 8,
            fontSize: '0.8rem', color: '#c62828',
          }}>
            Con atrasos: {vecnosConAtraso.join(', ')}
          </div>
        )}
        {vecnosConAtraso.length === 0 && (
          <div style={{
            padding: '8px 10px', marginTop: 6,
            background: '#e8f5e9', borderRadius: 8,
            fontSize: '0.8rem', color: '#388e3c',
          }}>
            Sin atrasos registrados
          </div>
        )}
      </Card>

      {/* ── 6. Acceso gestión ── */}
      <button
        onClick={() => onNavChange('ajustes')}
        style={{
          width: '100%',
          background: 'var(--g1)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.95rem',
          marginBottom: 12,
        }}
      >
        <span>Gestionar huerto</span>
        <IcoChevronRight size={18} />
      </button>

    </div>
  );
}
