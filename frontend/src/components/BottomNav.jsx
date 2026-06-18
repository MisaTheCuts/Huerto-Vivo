import { IcoHome, IcoLeaf, IcoUsers, IcoBell } from './icons';

const ITEMS = [
  { key: 'inicio',     Icon: IcoHome,  label: 'Inicio'    },
  { key: 'parcela',   Icon: IcoLeaf,  label: 'Mi Parcela' },
  { key: 'comunidad', Icon: IcoUsers, label: 'Comunidad' },
  { key: 'alertas',   Icon: IcoBell,  label: 'Alertas'   },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ key, Icon, label }) => (
        <button
          key={key}
          className={active === key ? 'active' : ''}
          onClick={() => onChange(key)}
        >
          <span className="nav-icon">
            <Icon size={20} />
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}
