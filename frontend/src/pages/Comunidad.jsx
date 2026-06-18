import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { api } from '../api';
import { IcoSearch } from '../components/icons';

const COLORES = ['av-green', 'av-orange', 'av-blue', 'av-purple', 'av-teal'];

// Parcelas de los 9 usuarios reales, ordenadas como establece el caso
const PARCELA_DISPLAY_MAP = {
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

// Vecinos registrados en la comunidad pero aún sin acceso activo al sistema (P-10 a P-18)
const VECINOS_EXTRA = [
  { id_usuario: 'ex-1', nombre: 'Diego Morales',   rol: 'vecino', activo: 0, numeroParcela: 'P-10' },
  { id_usuario: 'ex-2', nombre: 'Valentina Rojas', rol: 'vecino', activo: 0, numeroParcela: 'P-11' },
  { id_usuario: 'ex-3', nombre: 'Felipe Soto',     rol: 'vecino', activo: 0, numeroParcela: 'P-12' },
  { id_usuario: 'ex-4', nombre: 'Camila Herrera',  rol: 'vecino', activo: 0, numeroParcela: 'P-13' },
  { id_usuario: 'ex-5', nombre: 'Andrés Pizarro',  rol: 'vecino', activo: 0, numeroParcela: 'P-14' },
  { id_usuario: 'ex-6', nombre: 'Natalia Fuentes', rol: 'vecino', activo: 0, numeroParcela: 'P-15' },
  { id_usuario: 'ex-7', nombre: 'Rodrigo Silva',   rol: 'vecino', activo: 0, numeroParcela: 'P-16' },
  { id_usuario: 'ex-8', nombre: 'Paula Araya',     rol: 'vecino', activo: 0, numeroParcela: 'P-17' },
  { id_usuario: 'ex-9', nombre: 'Ignacio Torres',  rol: 'vecino', activo: 0, numeroParcela: 'P-18' },
];

function iniciales(nombre) {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export default function Comunidad() {
  const [usuarios, setUsuarios] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([api.getUsuarios(), api.getParcelas()])
      .then(([u, p]) => { setUsuarios(u); setParcelas(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Lista completa: usuarios de BD + vecinos extra registrados
  const todos = [...usuarios, ...VECINOS_EXTRA];

  // Número de parcela para mostrar: mapa estático (fiable) > DB como fallback
  const numeroParcela = (u) =>
    PARCELA_DISPLAY_MAP[u.nombre] ?? u.numeroParcela ?? null;

  const filtrados = todos.filter(u => {
    const np = numeroParcela(u) || '';
    return (
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      np.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  // Contadores globales (sobre todos, sin filtro de búsqueda)
  const totalMiembros  = todos.length;
  const vecinosActivos = usuarios.filter(u => u.rol === 'vecino').length;
  const totalCoord     = usuarios.filter(u => u.rol === 'admin').length;

  return (
    <div className="screen p-16">
      <h2 className="page-title">Comunidad</h2>
      <p className="page-subtitle">Conoce a los vecinos que cuidan este huerto.</p>

      {/* Buscador */}
      <div className="input-icon" style={{ marginBottom: 14 }}>
        <span className="icon"><IcoSearch size={17} /></span>
        <input
          className="input"
          placeholder="Buscar vecino o parcela..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Contador principal */}
      <Card style={{ textAlign: 'center', padding: '12px 8px', marginBottom: 8 }}>
        <span style={{ fontWeight: 500, fontSize: '0.82rem', color: '#757575' }}>
          Total de vecinos
        </span>
        <span style={{
          fontWeight: 800, fontSize: '1.8rem',
          color: '#1b5e20', display: 'block', lineHeight: 1.2,
        }}>
          {totalMiembros}
        </span>
      </Card>

      {/* Contadores secundarios */}
      <div className="flex gap-8 mb-12">
        <Card style={{ flex: 1, textAlign: 'center', padding: '10px 8px', marginBottom: 0 }}>
          <span style={{ fontWeight: 500, fontSize: '0.82rem', color: '#757575' }}>
            Con actividad reciente
          </span>
          <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#388e3c', display: 'block' }}>
            {vecinosActivos}
          </span>
        </Card>
        <Card style={{ flex: 1, textAlign: 'center', padding: '10px 8px', marginBottom: 0 }}>
          <span style={{ fontWeight: 500, fontSize: '0.82rem', color: '#757575' }}>
            Coordinadores
          </span>
          <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#388e3c', display: 'block' }}>
            {totalCoord}
          </span>
        </Card>
      </div>

      {/* Lista de participantes */}
      {loading ? (
        <p className="text-gris">Cargando...</p>
      ) : (
        <>
          <p className="section-title" style={{ marginTop: 4, marginBottom: 10 }}>
            Participantes{busqueda ? ` · ${filtrados.length} resultado${filtrados.length !== 1 ? 's' : ''}` : ''}
          </p>

          {filtrados.map((u, i) => {
            const np    = numeroParcela(u);
            const color = COLORES[i % COLORES.length];

            return (
              <Card key={u.id_usuario} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Avatar */}
                  <div className={`avatar ${color}`} style={{ width: 46, height: 46, fontSize: '1rem' }}>
                    {iniciales(u.nombre)}
                  </div>

                  {/* Nombre + parcela */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{u.nombre}</div>
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>
                      {np ? `Parcela ${np}` : 'Sin parcela'}
                    </div>
                  </div>

                  {/* Badge de rol */}
                  {u.rol === 'admin' ? (
                    <span className="badge" style={{ background: '#388e3c', color: '#fff' }}>
                      Coordinadora
                    </span>
                  ) : (
                    <span className="badge badge-gray">Vecino</span>
                  )}
                </div>
              </Card>
            );
          })}

          {filtrados.length === 0 && (
            <p className="text-gris" style={{ textAlign: 'center', marginTop: 24 }}>
              No se encontraron resultados.
            </p>
          )}
        </>
      )}
    </div>
  );
}
