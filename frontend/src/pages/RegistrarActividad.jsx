import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { api } from '../api';
import { IcoDrop, IcoSeedling, IcoHarvest, IcoAlert } from '../components/icons';

const TABS = [
  { key: 'riego',    label: 'Riego',   Icon: IcoDrop     },
  { key: 'siembra',  label: 'Siembra', Icon: IcoSeedling },
  { key: 'cosecha',  label: 'Cosecha', Icon: IcoHarvest  },
  { key: 'problema', label: 'Reporte', Icon: IcoAlert    },
];

// Mapeo del tab al tipo de actividad que acepta el backend
const TAB_A_TIPO = {
  riego:    'riego',
  siembra:  'otro',
  problema: 'control_plagas',
};

export default function RegistrarActividad({ usuario, onNavChange, initialTab = 'riego' }) {
  const [tab,       setTab]       = useState(initialTab);
  const [parcelas,  setParcelas]  = useState([]);
  const [cultivos,  setCultivos]  = useState([]);
  const [siembras,  setSiembras]  = useState([]);
  const [turnos,    setTurnos]    = useState([]);

  // Campos comunes
  const [idParcela,  setIdParcela]  = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Campos cosecha
  const [idSiembra,   setIdSiembra]   = useState('');
  const [cantidadKg,  setCantidadKg]  = useState('');
  const [fecha,       setFecha]       = useState(new Date().toISOString().split('T')[0]);
  const [notas,       setNotas]       = useState('');

  const [loading,  setLoading]  = useState(false);
  const [mensaje,  setMensaje]  = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const esAdmin  = usuario.rol === 'admin';

  useEffect(() => {
    api.getParcelas().then(data => {
      setParcelas(data);
      if (!esAdmin) {
        const miParcela = data.find(p => p.vecino === usuario.nombre);
        if (miParcela) setIdParcela(String(miParcela.id_parcela));
      }
    }).catch(() => {});
    api.getCultivos().then(setCultivos).catch(() => {});
    api.getTurnos().then(setTurnos).catch(() => {});
  }, [usuario, esAdmin]);

  // Carga siembras cuando cambia la parcela (para cosecha)
  useEffect(() => {
    if (tab === 'cosecha' && idParcela) {
      api.getCosechas().then(() => {}).catch(() => {});
    }
  }, [tab, idParcela]);

  const guardar = async (e) => {
    e.preventDefault();
    setMensaje('');
    setErrorMsg('');
    setLoading(true);

    try {
      if (tab === 'cosecha') {
        if (!idSiembra || !fecha) {
          setErrorMsg('Selecciona una siembra y una fecha.');
          setLoading(false);
          return;
        }
        const data = await api.createCosecha({
          id_siembra:  parseInt(idSiembra),
          id_usuario:  usuario.id_usuario,
          fecha,
          cantidad_kg: cantidadKg ? parseFloat(cantidadKg) : null,
          notas:       notas || null,
        });
        if (data.error) setErrorMsg(data.error);
        else setMensaje('¡Cosecha registrada correctamente!');
      } else {
        if (!idParcela) {
          setErrorMsg('Selecciona una parcela.');
          setLoading(false);
          return;
        }
        const data = await api.createActividad({
          id_parcela:  parseInt(idParcela),
          id_usuario:  usuario.id_usuario,
          tipo:        TAB_A_TIPO[tab] || 'otro',
          descripcion: descripcion || null,
        });
        if (data.error) {
          setErrorMsg(data.error);
        } else {
          // Si es un riego, marcar el turno pendiente de hoy como cumplido
          if (tab === 'riego') {
            const hoy          = new Date().toISOString().split('T')[0];
            const parcelaObj   = parcelas.find(p => p.id_parcela === parseInt(idParcela));
            const turnoHoy     = turnos.find(t =>
              t.parcela === parcelaObj?.numero &&
              String(t.fecha).startsWith(hoy) &&
              !t.completado
            );
            if (turnoHoy) await api.cumplirTurno(turnoHoy.id_turno);
          }
          setMensaje('¡Registro guardado correctamente!');
        }
      }
    } catch {
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const parcelaNombre = parcelas.find(p => p.id_parcela === parseInt(idParcela));

  return (
    <div className="screen p-16">
      <h2 className="page-title">Registrar Actividad</h2>
      <p className="page-subtitle">Agrega un nuevo registro al historial de tu parcela.</p>

      {/* Tabs */}
      <div className="type-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`type-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => { setTab(t.key); setMensaje(''); setErrorMsg(''); }}
          >
            <t.Icon size={18} />
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <form onSubmit={guardar}>
          {/* Parcela */}
          <div className="form-group">
            <label>Parcela</label>
            {esAdmin ? (
              <select
                className="input"
                value={idParcela}
                onChange={e => setIdParcela(e.target.value)}
                required
              >
                <option value="">Selecciona una parcela</option>
                {parcelas.map(p => (
                  <option key={p.id_parcela} value={p.id_parcela}>
                    {p.numero} — {p.vecino || 'Sin asignar'}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                value={parcelaNombre ? `${parcelaNombre.numero}` : 'Cargando...'}
                disabled
              />
            )}
          </div>

          {/* Contenido por tab */}
          {tab === 'cosecha' ? (
            <>
              <div className="form-group">
                <label>Tipo de cultivo</label>
                <select
                  className="input"
                  value={idSiembra}
                  onChange={e => setIdSiembra(e.target.value)}
                  required
                >
                  <option value="">Selecciona un cultivo</option>
                  {cultivos.map(c => (
                    <option key={c.id_cultivo} value={c.id_cultivo}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Cantidad cosechada (kg)</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej. 2.50"
                  value={cantidadKg}
                  onChange={e => setCantidadKg(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Fecha de recolección</label>
                <input
                  className="input"
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Responsable</label>
                <input
                  className="input"
                  value={usuario.nombre}
                  disabled={!esAdmin}
                  readOnly={!esAdmin}
                />
              </div>
              <div className="form-group">
                <label>Notas adicionales (opcional)</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Ej. Los tomates estaban maduros y en buen estado"
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder={
                tab === 'riego'    ? 'Ej. Riego matutino completo' :
                tab === 'problema' ? 'Ej. Se detectaron pulgones en la zanahoria' :
                'Ej. Siembra de tomates cherry'
              }
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>Responsable</label>
                <input
                  className="input"
                  value={usuario.nombre}
                  disabled={!esAdmin}
                  readOnly={!esAdmin}
                />
              </div>
            </>
          )}

          {/* Info aviso */}
          <div style={{
            background: 'var(--g3)', borderRadius: 8, padding: '10px 12px',
            fontSize: '0.8rem', color: 'var(--g1)', marginBottom: 16
          }}>
            Este registro quedará visible en el historial comunitario del huerto.
          </div>

          {errorMsg && <p className="error-msg mb-8">{errorMsg}</p>}
          {mensaje  && <p className="success-msg mb-8">{mensaje}</p>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar registro'}
          </button>
          <button
            type="button"
            className="btn btn-outline mt-8"
            onClick={() => onNavChange('parcela')}
          >
            Cancelar
          </button>
        </form>
      </Card>
    </div>
  );
}
