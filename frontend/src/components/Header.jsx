import { IcoLeaf, IcoSettings } from './icons';

export default function Header({ onSettings }) {
  return (
    <div className="header">
      <div className="header-logo">
        <div className="header-icon">
          <IcoLeaf size={17} />
        </div>
        <span>Huerto Vivo</span>
      </div>
      {onSettings && (
        <button className="header-btn" onClick={onSettings} title="Ajustes">
          <IcoSettings size={18} />
        </button>
      )}
    </div>
  );
}
