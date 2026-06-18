const BASE_URL = 'http://localhost:3001';

export const api = {
  login: (correo, contrasena) =>
    fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena }),
    }).then(r => r.json()),

  getUsuarios: () =>
    fetch(`${BASE_URL}/api/usuarios`).then(r => r.json()),

  getParcelas: () =>
    fetch(`${BASE_URL}/api/parcelas`).then(r => r.json()),

  getParcelaById: (id) =>
    fetch(`${BASE_URL}/api/parcelas/${id}`).then(r => r.json()),

  getCultivos: () =>
    fetch(`${BASE_URL}/api/cultivos`).then(r => r.json()),

  getTurnos: () =>
    fetch(`${BASE_URL}/api/turnos`).then(r => r.json()),

  cumplirTurno: (id) =>
    fetch(`${BASE_URL}/api/turnos/${id}/cumplir`, { method: 'PUT' }).then(r => r.json()),

  reiniciarDemo: () =>
    fetch(`${BASE_URL}/api/turnos/reiniciar-demo`, { method: 'POST' }).then(r => r.json()),

  getActividades: () =>
    fetch(`${BASE_URL}/api/actividades`).then(r => r.json()),

  createActividad: (data) =>
    fetch(`${BASE_URL}/api/actividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getCosechas: () =>
    fetch(`${BASE_URL}/api/cosechas`).then(r => r.json()),

  createCosecha: (data) =>
    fetch(`${BASE_URL}/api/cosechas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getNotificaciones: (id_usuario) =>
    fetch(`${BASE_URL}/api/notificaciones${id_usuario ? `?id_usuario=${id_usuario}` : ''}`).then(r => r.json()),

  marcarLeida: (id) =>
    fetch(`${BASE_URL}/api/notificaciones/${id}/leida`, { method: 'PUT' }).then(r => r.json()),
};
