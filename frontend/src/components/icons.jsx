// Íconos SVG minimalistas — estilo Feather, sin dependencias externas
// Uso: <IcoHome size={22} /> — size es opcional, default 22

function Ico({ size = 22, children, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
    >
      {children}
    </svg>
  );
}

export const IcoHome = ({ size }) => (
  <Ico size={size}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </Ico>
);

export const IcoLeaf = ({ size }) => (
  <Ico size={size}>
    <path d="M17 8C8 10 5.9 16.17 3.82 19.98L2 22"/>
    <path d="M21 8c-1.5-2.5-5-5-10-3C5 7 2 13 2 22c5.5-2 11-4 19-14z"/>
  </Ico>
);

export const IcoUsers = ({ size }) => (
  <Ico size={size}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </Ico>
);

export const IcoBell = ({ size }) => (
  <Ico size={size}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </Ico>
);

export const IcoSettings = ({ size }) => (
  <Ico size={size}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </Ico>
);

export const IcoDrop = ({ size }) => (
  <Ico size={size}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
  </Ico>
);

export const IcoCheck = ({ size }) => (
  <Ico size={size}>
    <polyline points="20,6 9,17 4,12"/>
  </Ico>
);

export const IcoCheckCircle = ({ size }) => (
  <Ico size={size}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </Ico>
);

export const IcoAlert = ({ size }) => (
  <Ico size={size}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </Ico>
);

export const IcoUser = ({ size }) => (
  <Ico size={size}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </Ico>
);

export const IcoLock = ({ size }) => (
  <Ico size={size}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </Ico>
);

export const IcoSearch = ({ size }) => (
  <Ico size={size}>
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </Ico>
);

export const IcoChevronRight = ({ size }) => (
  <Ico size={size}>
    <polyline points="9,18 15,12 9,6"/>
  </Ico>
);

export const IcoX = ({ size }) => (
  <Ico size={size}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </Ico>
);

export const IcoCalendar = ({ size }) => (
  <Ico size={size}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </Ico>
);

export const IcoSeedling = ({ size }) => (
  <Ico size={size}>
    <path d="M12 22V12"/>
    <path d="M12 12c0 0-7 0-7-5s7-5 7 5z"/>
    <path d="M12 12c0 0 7 0 7-5s-7-5-7 5z"/>
  </Ico>
);

export const IcoHarvest = ({ size }) => (
  <Ico size={size}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </Ico>
);

export const IcoBarChart = ({ size }) => (
  <Ico size={size}>
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </Ico>
);

export const IcoLogOut = ({ size }) => (
  <Ico size={size}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </Ico>
);

export const IcoClock = ({ size }) => (
  <Ico size={size}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </Ico>
);

export const IcoEdit = ({ size }) => (
  <Ico size={size}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </Ico>
);

export const IcoMail = ({ size }) => (
  <Ico size={size}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </Ico>
);
