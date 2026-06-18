const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'huerto_vivo',
  port:     process.env.DB_PORT     || 3306,
  waitForConnections: true,
  connectionLimit:    10,
});

// Verificación de conexión al arrancar
pool.getConnection()
  .then(conn => {
    console.log('Conexión a MySQL establecida correctamente');
    conn.release();
  })
  .catch(err => {
    console.error('Error al conectar con MySQL:', err.message);
  });

module.exports = pool;
