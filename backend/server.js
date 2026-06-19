require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes           = require('./routes/authRoutes');
const usuariosRoutes       = require('./routes/usuariosRoutes');
const parcelasRoutes       = require('./routes/parcelasRoutes');
const cultivosRoutes       = require('./routes/cultivosRoutes');
const siembrasRoutes       = require('./routes/siembrasRoutes');
const turnosRoutes         = require('./routes/turnosRoutes');
const actividadesRoutes    = require('./routes/actividadesRoutes');
const cosechasRoutes       = require('./routes/cosechasRoutes');
const notificacionesRoutes = require('./routes/notificacionesRoutes');

const app  = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta raíz de comprobación
app.get('/', (req, res) => {
  res.json({ mensaje: 'API Huerto Vivo funcionando correctamente' });
});

// Rutas de la API
app.use('/api/auth',           authRoutes);
app.use('/api/usuarios',       usuariosRoutes);
app.use('/api/parcelas',       parcelasRoutes);
app.use('/api/cultivos',       cultivosRoutes);
app.use('/api/siembras',       siembrasRoutes);
app.use('/api/turnos',         turnosRoutes);
app.use('/api/actividades',    actividadesRoutes);
app.use('/api/cosechas',       cosechasRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor Huerto Vivo corriendo en http://localhost:${PORT}`);
});
