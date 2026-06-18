import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { api } from '../api';
import { PARCELA_DISPLAY, CULTIVO_PRINCIPAL } from '../huerto';
import { IcoDrop, IcoSeedling, IcoHarvest, IcoAlert, IcoChevronRight } from '../components/icons';

// Parcela de coordinación mostrada cuando el admin no tiene parcela asignada en la BD
const PARCELA_COORDINACION = {
  id_parcela:  'coord',
  numero:      'P-01',
  descripcion: 'Parcela comunitaria, sector coordinación',
  tamanio_m2:  5.00,
  estado:      'ocupada',
  vecino:      null,
};

// ─── helpers de fecha ────────────────────────────────────────────
function isoFecha(valor) {
  // Normaliza fecha de cualquier formato MySQL/JS a 'YYYY-MM-DD' local
  const d = new Date(valor);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function horaLocal() {
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60; // horas decimales, ej: 9.5 = 09:30
}

// ─── cálculo de indicadores ──────────────────────────────────────

/**
 * Devuelve el datetime más reciente de un riego, buscando en:
 *   - actividades de tipo 'riego'
 *   - turnos completados
 */
function ultimoRiegoDt(actividades, turnos) {
  let mejor = null;

  actividades.filter(a => a.tipo === 'riego').forEach(a => {
    const dt = new Date(a.fecha);
    if (!mejor || dt > mejor) mejor = dt;
  });

  turnos.filter(t => t.completado).forEach(t => {
    const fechaStr = String(t.fecha).split('T')[0];
    const hora     = t.hora_inicio?.slice(0, 5) || '08:00';
    const dt       = new Date(`${fechaStr}T${hora}:00`);
    if (!mejor || dt > mejor) mejor = dt;
  });

  return mejor; // Date | null
}

/**
 * "Hace X hrs" | "Hace X min" | "Ayer" | "Sin registro"
 */
function textoUltimoRiego(actividades, turnos) {
  const dt = ultimoRiegoDt(actividades, turnos);
  if (!dt) return 'Sin registro';

  const diffMs = Date.now() - dt.getTime();
  const diffH  = Math.floor(diffMs / 3600000);
  const diffMin = Math.floor((diffMs % 3600000) / 60000);

  if (diffH < 1)  return diffMin <= 1 ? 'Hace poco' : `Hace ${diffMin} min`;
  if (diffH < 24) return `Hace ${diffH} hr${diffH !== 1 ? 's' : ''}`;

  const ayer = isoFecha(Date.now() - 86400000);
  if (isoFecha(dt) === ayer) return 'Ayer';

  const diffD = Math.floor(diffH / 24);
  return `Hace ${diffD} días`;
}

/**
 * Lógica de próximo riego basada en la hora actual y el horario del turno (base 08:00):
 *   - "Mañana 08:00"  → ya se regó hoy
 *   - "Faltan X hrs"  → aún no llega la hora de riego
 *   - "Faltan X min"  → faltan menos de 60 min
 *   - "Atrasado X hrs"→ ya pasó la hora de riego sin regarse
 *
 * Retorna { texto: string, atrasado: boolean }
 */
function calcProximoRiego(actividades, turnos) {
  const hoy = isoFecha(Date.now());

  // ¿Ya se regó hoy? (turno cumplido HOY o actividad tipo riego HOY)
  const regadoHoy =
    turnos.some(t => t.completado && isoFecha(t.fecha) === hoy) ||
    actividades.some(a => a.tipo === 'riego' && isoFecha(a.fecha) === hoy);

  if (regadoHoy) return { texto: 'Mañana 08:00', atrasado: false };

  // Hora de referencia: hora_inicio del turno pendiente de hoy, si existe; si no, 08:00
  const turnoHoy = turnos.find(t => !t.completado && isoFecha(t.fecha) === hoy);
  const horaRef  = turnoHoy?.hora_inicio?.slice(0, 5) || '08:00';
  const [hRef, mRef] = horaRef.split(':').map(Number);

  const ahora       = new Date();
  const dtRiego     = new Date(ahora);
  dtRiego.setHours(hRef, mRef, 0, 0);

  const diffMs = dtRiego.getTime() - ahora.getTime();
  const diffH  = Math.floor(Math.abs(diffMs) / 3600000);
  const diffMin = Math.floor((Math.abs(diffMs) % 3600000) / 60000);

  if (diffMs > 0) {
    // Falta tiempo
    if (diffH < 1) return { texto: `Faltan ${diffMin} min`, atrasado: false };
    return { texto: `Faltan ${diffH} hr${diffH !== 1 ? 's' : ''}`, atrasado: false };
  } else {
    // Ya pasó la hora sin riego
    if (diffH < 1) return { texto: `Atrasado ${diffMin} min`, atrasado: true };
    return { texto: `Atrasado ${diffH} hr${diffH !== 1 ? 's' : ''}`, atrasado: true };
  }
}

// ─── componente ──────────────────────────────────────────────────

export default function MiParcela({ usuario, onNavChange }) {
  const [parcela,     setParcela]     = useState(null);
  const [actividades, setActividades] = useState([]);  // todas las de esta parcela
  const [turnos,      setTurnos]      = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.getParcelas(),
      api.getActividades(),
      api.getTurnos(),
    ]).then(([parc, acts, turns]) => {
      const deApi     = parc.find(p => p.vecino === usuario.nombre);
      const miParcela = deApi || (usuario.rol === 'admin' ? PARCELA_COORDINACION : null);
      setParcela(miParcela || null);

      if (miParcela) {
        // Guardamos TODAS las actividades de la parcela (sin truncar) para la lógica de riego
        setActividades(acts.filter(a => a.parcela === miParcela.numero));
        setTurnos(turns.filter(t => t.parcela === miParcela.numero));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [usuario]);

  // ── derivados ────────────────────────────────────────────────
  const textoUltimo   = textoUltimoRiego(actividades, turnos);
  const proximoRiego  = calcProximoRiego(actividades, turnos);

  const iconoActividad = (tipo) => {
    if (tipo === 'riego')         return <IcoDrop size={16} />;
    if (tipo === 'fertilizacion') return <IcoSeedling size={16} />;
    if (tipo === 'poda')          return <IcoSeedling size={16} />;
    if (tipo === 'control_plagas') return <IcoAlert size={16} />;
    return <IcoHarvest size={16} />;
  };

  const claseIcono = (tipo) => {
    if (tipo === 'riego') return 'riego';
    if (tipo === 'fertilizacion' || tipo === 'poda') return 'cosecha';
    return 'otro';
  };

  // Número correcto de parcela y cultivo principal (independiente del estado de la BD)
  const displayNumero    = parcela ? (PARCELA_DISPLAY[usuario.nombre] || parcela.numero) : null;
  const cultivoPrincipal = displayNumero ? (CULTIVO_PRINCIPAL[displayNumero] || '—') : '—';

  if (loading) return <div className="p-16 text-gris">Cargando...</div>;

  return (
    <div className="screen p-16">
      <h2 className="page-title">Mi Parcela</h2>
      <p className="page-subtitle">Revisa y cuida tu espacio del huerto</p>

      {!parcela ? (
        <Card><p className="text-gris">No tienes una parcela asignada.</p></Card>
      ) : (
        <>
          {/* Card imagen parcela */}
          <div className="parcela-img-card">
            <div className="parcela-overlay">
              <h3>{displayNumero}</h3>
              <div className="info-grid" style={{ marginBottom: 0 }}>
                <div className="info-cell">
                  <label style={{ color: 'rgba(255,255,255,0.75)' }}>Cultivo principal</label>
                  <span style={{ color: '#fff' }}>{cultivoPrincipal}</span>
                </div>
                <div className="info-cell">
                  <label style={{ color: 'rgba(255,255,255,0.75)' }}>Estado</label>
                  <span style={{ color: '#a5d6a7' }}>● Saludable</span>
                </div>
                <div className="info-cell">
                  <label style={{ color: 'rgba(255,255,255,0.75)' }}>Responsable</label>
                  <span style={{ color: '#fff' }}>{usuario.nombre}</span>
                </div>
                <div className="info-cell">
                  <label style={{ color: 'rgba(255,255,255,0.75)' }}>Ubicación</label>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem' }}>
                    {parcela.descripcion?.split(',')[0] || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats rápidas */}
          <Card>
            <div className="stats-row">

              {/* Humedad */}
              <div className="stat-box">
                <span className="stat-num">65%</span>
                <span className="stat-label">Humedad óptima</span>
              </div>

              {/* Último riego */}
              <div className="stat-box">
                <span style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: textoUltimo === 'Sin registro' ? '#9e9e9e' : 'var(--verde-oscuro)',
                  display: 'block',
                  lineHeight: 1.3,
                }}>
                  {textoUltimo}
                </span>
                <span className="stat-label">Último riego</span>
              </div>

              {/* Próximo riego */}
              <div className="stat-box">
                <span style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: proximoRiego.atrasado ? '#e65100' : 'var(--verde-oscuro)',
                  display: 'block',
                  lineHeight: 1.3,
                }}>
                  {proximoRiego.texto}
                </span>
                <span className="stat-label">Próximo riego</span>
              </div>

            </div>
          </Card>

          {/* Acciones */}
          <Card style={{ marginTop: 12, marginBottom: 12 }}>
            <p style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.85rem', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Acciones
            </p>
            {[
              { label: 'Marcar riego cumplido', Icon: IcoDrop,     tipo: 'riego',    color: 'var(--g1)',     bg: 'var(--g3)' },
              { label: 'Registrar siembra',     Icon: IcoSeedling, tipo: 'siembra',  color: '#1565c0',       bg: '#e3f2fd'   },
              { label: 'Registrar cosecha',     Icon: IcoHarvest,  tipo: 'cosecha',  color: 'var(--naranja)', bg: 'var(--naranja-bg)' },
              { label: 'Reportar problema',     Icon: IcoAlert,    tipo: 'problema', color: 'var(--rojo)',   bg: 'var(--rojo-bg)' },
            ].map((accion, i, arr) => (
              <button
                key={accion.tipo}
                onClick={() => onNavChange('actividad', accion.tipo)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 4px',
                  background: 'none',
                  border: 'none',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--borde)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: accion.bg, color: accion.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <accion.Icon size={18} />
                </div>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.92rem', color: accion.color }}>
                  {accion.label}
                </span>
                <IcoChevronRight size={16} style={{ color: 'var(--borde)' }} />
              </button>
            ))}
          </Card>

          {/* Historial reciente — muestra las últimas 4 actividades */}
          <Card>
            <p style={{ fontWeight: 700, marginBottom: 10 }}>Historial reciente</p>
            {actividades.length === 0 ? (
              <p className="text-gris" style={{ fontSize: '0.85rem' }}>Sin actividades registradas.</p>
            ) : (
              actividades.slice(0, 4).map(a => (
                <div key={a.id_actividad} className="historial-item">
                  <div className={`historial-icon ${claseIcono(a.tipo)}`}>
                    {iconoActividad(a.tipo)}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.88rem', fontWeight: 500 }}>
                      {a.usuario} — {a.tipo}
                    </p>
                    {a.descripcion && (
                      <p style={{ fontSize: '0.78rem', color: '#888' }}>{a.descripcion}</p>
                    )}
                    <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 2 }}>
                      {new Date(a.fecha).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </Card>
        </>
      )}
    </div>
  );
}
