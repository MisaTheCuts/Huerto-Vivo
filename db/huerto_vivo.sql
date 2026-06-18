-- =============================================================
-- HUERTO VIVO - Script de Base de Datos
-- Proyecto académico: Huerto Urbano Comunitario
-- Base de datos: MySQL
-- =============================================================

-- Crear y seleccionar la base de datos
CREATE DATABASE IF NOT EXISTS huerto_vivo
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_spanish_ci;

USE huerto_vivo;

-- =============================================================
-- TABLA: roles
-- Define los tipos de usuario del sistema
-- =============================================================
CREATE TABLE IF NOT EXISTS roles (
    id_rol       INT          NOT NULL AUTO_INCREMENT,
    nombre       VARCHAR(50)  NOT NULL,
    descripcion  VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id_rol),
    UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- TABLA: usuarios
-- Almacena a todos los participantes del huerto
-- =============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario   INT          NOT NULL AUTO_INCREMENT,
    nombre       VARCHAR(100) NOT NULL,
    correo       VARCHAR(150) NOT NULL,
    contrasena   VARCHAR(255) NOT NULL,  -- Se guardará hasheada en el backend
    telefono     VARCHAR(20)  DEFAULT NULL,
    id_rol       INT          NOT NULL,
    activo       TINYINT(1)   NOT NULL DEFAULT 1,
    fecha_registro DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario),
    UNIQUE KEY uq_usuarios_correo (correo),
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- TABLA: parcelas
-- Representa cada parcela física del huerto
-- =============================================================
CREATE TABLE IF NOT EXISTS parcelas (
    id_parcela   INT          NOT NULL AUTO_INCREMENT,
    numero       VARCHAR(20)  NOT NULL,
    descripcion  VARCHAR(255) DEFAULT NULL,
    tamanio_m2   DECIMAL(6,2) DEFAULT NULL,
    estado       ENUM('disponible','ocupada','en_mantenimiento') NOT NULL DEFAULT 'disponible',
    id_usuario   INT          DEFAULT NULL,  -- Vecino asignado a la parcela
    PRIMARY KEY (id_parcela),
    UNIQUE KEY uq_parcelas_numero (numero),
    CONSTRAINT fk_parcelas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- TABLA: cultivos
-- Catálogo de plantas y vegetales disponibles
-- =============================================================
CREATE TABLE IF NOT EXISTS cultivos (
    id_cultivo      INT          NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(100) NOT NULL,
    tipo            VARCHAR(100) DEFAULT NULL,  -- Ej: hortaliza, hierba, fruta
    dias_cosecha    INT          DEFAULT NULL,  -- Días aproximados hasta cosechar
    descripcion     VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id_cultivo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- TABLA: siembras
-- Registra qué cultivo se sembró en cada parcela y cuándo
-- =============================================================
CREATE TABLE IF NOT EXISTS siembras (
    id_siembra      INT          NOT NULL AUTO_INCREMENT,
    id_parcela      INT          NOT NULL,
    id_cultivo      INT          NOT NULL,
    id_usuario      INT          NOT NULL,  -- Quién registró la siembra
    fecha_siembra   DATE         NOT NULL,
    fecha_esperada_cosecha DATE  DEFAULT NULL,
    estado          ENUM('en_crecimiento','cosechado','perdido') NOT NULL DEFAULT 'en_crecimiento',
    notas           TEXT         DEFAULT NULL,
    PRIMARY KEY (id_siembra),
    CONSTRAINT fk_siembras_parcela  FOREIGN KEY (id_parcela)  REFERENCES parcelas (id_parcela),
    CONSTRAINT fk_siembras_cultivo  FOREIGN KEY (id_cultivo)  REFERENCES cultivos (id_cultivo),
    CONSTRAINT fk_siembras_usuario  FOREIGN KEY (id_usuario)  REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- TABLA: turnos_riego
-- Asigna días y horarios de riego a cada vecino
-- =============================================================
CREATE TABLE IF NOT EXISTS turnos_riego (
    id_turno     INT          NOT NULL AUTO_INCREMENT,
    id_usuario   INT          NOT NULL,
    id_parcela   INT          NOT NULL,
    fecha        DATE         NOT NULL,
    hora_inicio  TIME         DEFAULT NULL,
    hora_fin     TIME         DEFAULT NULL,
    completado   TINYINT(1)   NOT NULL DEFAULT 0,
    PRIMARY KEY (id_turno),
    CONSTRAINT fk_turnos_usuario  FOREIGN KEY (id_usuario)  REFERENCES usuarios (id_usuario),
    CONSTRAINT fk_turnos_parcela  FOREIGN KEY (id_parcela)  REFERENCES parcelas (id_parcela)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- TABLA: actividades
-- Registro general de acciones realizadas en las parcelas
-- Tipos: riego, fertilización, poda, control_plagas, otro
-- =============================================================
CREATE TABLE IF NOT EXISTS actividades (
    id_actividad  INT          NOT NULL AUTO_INCREMENT,
    id_parcela    INT          NOT NULL,
    id_usuario    INT          NOT NULL,
    tipo          ENUM('riego','fertilizacion','poda','control_plagas','otro') NOT NULL,
    descripcion   TEXT         DEFAULT NULL,
    fecha         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_actividad),
    CONSTRAINT fk_actividades_parcela FOREIGN KEY (id_parcela) REFERENCES parcelas (id_parcela),
    CONSTRAINT fk_actividades_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- TABLA: cosechas
-- Registra las cosechas realizadas por los vecinos
-- =============================================================
CREATE TABLE IF NOT EXISTS cosechas (
    id_cosecha   INT          NOT NULL AUTO_INCREMENT,
    id_siembra   INT          NOT NULL,
    id_usuario   INT          NOT NULL,  -- Quién cosechó
    fecha        DATE         NOT NULL,
    cantidad_kg  DECIMAL(6,2) DEFAULT NULL,
    notas        TEXT         DEFAULT NULL,
    PRIMARY KEY (id_cosecha),
    CONSTRAINT fk_cosechas_siembra  FOREIGN KEY (id_siembra)  REFERENCES siembras (id_siembra),
    CONSTRAINT fk_cosechas_usuario  FOREIGN KEY (id_usuario)  REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- TABLA: notificaciones
-- Mensajes y alertas enviados a los usuarios
-- =============================================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id_notificacion  INT          NOT NULL AUTO_INCREMENT,
    id_usuario       INT          NOT NULL,  -- Destinatario
    titulo           VARCHAR(150) NOT NULL,
    mensaje          TEXT         NOT NULL,
    tipo             ENUM('info','alerta','recordatorio','reporte') NOT NULL DEFAULT 'info',
    leida            TINYINT(1)   NOT NULL DEFAULT 0,
    fecha_envio      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_notificacion),
    CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =============================================================
-- DATOS DE PRUEBA
-- =============================================================

-- -------------------------------------------------------------
-- Roles del sistema
-- -------------------------------------------------------------
INSERT INTO roles (nombre, descripcion) VALUES
    ('admin',  'Coordinadora del huerto, acceso total'),
    ('vecino', 'Vecino participante del huerto, acceso limitado');

-- -------------------------------------------------------------
-- Usuarios
-- Nota: las contraseñas aquí son texto plano solo para pruebas.
-- En producción el backend las hashea antes de guardarlas.
-- -------------------------------------------------------------
INSERT INTO usuarios (nombre, correo, contrasena, telefono, id_rol) VALUES
    -- Admin
    ('Carmen López',       'carmen@huertovivo.cl',    'admin123',   '+56912345678', 1),
    -- Vecinos
    ('Juan Contreras',     'juan@huertovivo.cl',      'vecino123',  '+56922345678', 2),
    ('María González',     'maria@huertovivo.cl',     'vecino123',  '+56933345678', 2),
    ('Pedro Ramírez',      'pedro@huertovivo.cl',     'vecino123',  '+56944345678', 2),
    ('Ana Flores',         'ana@huertovivo.cl',       'vecino123',  '+56955345678', 2),
    ('Luis Herrera',       'luis@huertovivo.cl',      'vecino123',  '+56966345678', 2),
    ('Rosa Muñoz',         'rosa@huertovivo.cl',      'vecino123',  '+56977345678', 2),
    ('Carlos Vega',        'carlos@huertovivo.cl',    'vecino123',  '+56988345678', 2),
    ('Sofía Torres',       'sofia@huertovivo.cl',     'vecino123',  '+56999345678', 2);

-- -------------------------------------------------------------
-- Parcelas (10 parcelas: P-01 coordinadora + P-02 a P-09 vecinos activos + P-10 disponible)
-- IMPORTANTE: el orden de inserción determina id_parcela (AUTO_INCREMENT).
--   id=1 → P-01 Carmen, id=2 → P-02 Juan, ..., id=9 → P-09 Sofía, id=10 → P-10 disponible
-- -------------------------------------------------------------
INSERT INTO parcelas (numero, descripcion, tamanio_m2, estado, id_usuario) VALUES
    ('P-01', 'Parcela comunitaria, sector coordinación', 5.00, 'ocupada',    1),  -- Carmen  (id=1)
    ('P-02', 'Parcela sector norte, junto al muro',      4.00, 'ocupada',    2),  -- Juan    (id=2)
    ('P-03', 'Parcela sector norte, centro',             4.00, 'ocupada',    3),  -- María   (id=3)
    ('P-04', 'Parcela sector norte, esquina',            4.50, 'ocupada',    4),  -- Pedro   (id=4)
    ('P-05', 'Parcela sector sur, junto al muro',        4.00, 'ocupada',    5),  -- Ana     (id=5)
    ('P-06', 'Parcela sector sur, centro',               4.00, 'ocupada',    6),  -- Luis    (id=6)
    ('P-07', 'Parcela sector sur, esquina',              4.50, 'ocupada',    7),  -- Rosa    (id=7)
    ('P-08', 'Parcela sector oriente',                   5.00, 'ocupada',    8),  -- Carlos  (id=8)
    ('P-09', 'Parcela sector oriente, fondo',            5.00, 'ocupada',    9),  -- Sofía   (id=9)
    ('P-10', 'Parcela disponible para nuevos vecinos',   3.50, 'disponible', NULL); -- (id=10)

-- -------------------------------------------------------------
-- Cultivos (catálogo general)
-- -------------------------------------------------------------
INSERT INTO cultivos (nombre, tipo, dias_cosecha, descripcion) VALUES
    ('Tomate',      'hortaliza', 75,  'Tomate cherry o perilla, ideal para espacios pequeños'),
    ('Lechuga',     'hortaliza', 45,  'Lechuga de hoja, crecimiento rápido'),
    ('Zanahoria',   'hortaliza', 80,  'Raíz, requiere suelo suelto y profundo'),
    ('Cilantro',    'hierba',    30,  'Hierba aromática de uso culinario'),
    ('Albahaca',    'hierba',    35,  'Hierba aromática, sensible al frío'),
    ('Pepino',      'hortaliza', 60,  'Necesita soporte para trepar'),
    ('Zapallo',     'hortaliza', 90,  'Ocupa bastante espacio, alto rendimiento'),
    ('Acelga',      'hortaliza', 50,  'Resistente, produce durante meses'),
    ('Espinaca',    'hortaliza', 40,  'Ideal para épocas frías'),
    ('Frutilla',    'fruta',    120,  'Frutal pequeño, produce en racimos');

-- -------------------------------------------------------------
-- Siembras registradas en las parcelas
-- -------------------------------------------------------------
INSERT INTO siembras (id_parcela, id_cultivo, id_usuario, fecha_siembra, fecha_esperada_cosecha, estado, notas) VALUES
    (2, 1,  2, '2026-04-10', '2026-06-24', 'en_crecimiento', 'Variedad cherry, riego en días alternos'),   -- P-02 Juan
    (2, 4,  2, '2026-04-15', '2026-05-15', 'cosechado',       'Primer cilantro de la temporada'),           -- P-02 Juan
    (3, 2,  3, '2026-04-12', '2026-05-27', 'cosechado',       'Lechuga romana, excelente resultado'),       -- P-03 María
    (3, 8,  3, '2026-04-20', '2026-06-09', 'en_crecimiento', 'Acelga verde, segunda siembra'),              -- P-03 María
    (4, 3,  4, '2026-03-20', '2026-06-08', 'en_crecimiento', 'Suelo bien suelto y abonado'),                -- P-04 Pedro
    (5, 5,  5, '2026-04-18', '2026-05-23', 'en_crecimiento', 'Albahaca genovesa'),                          -- P-05 Ana
    (6, 6,  6, '2026-04-05', '2026-06-04', 'en_crecimiento', 'Pepino ensalada, ya tiene guías'),            -- P-06 Luis
    (7, 9,  7, '2026-03-28', '2026-05-07', 'cosechado',       'Espinaca bebé, muy buena cosecha'),          -- P-07 Rosa
    (8, 7,  8, '2026-03-15', '2026-06-13', 'en_crecimiento', 'Zapallo italiano, va bien'),                  -- P-08 Carlos
    (9, 10, 9, '2026-04-01', '2026-08-29', 'en_crecimiento', 'Frutilla importada, necesita mucho sol');     -- P-09 Sofía

-- -------------------------------------------------------------
-- Turnos de riego (semana actual y próxima)
-- -------------------------------------------------------------
INSERT INTO turnos_riego (id_usuario, id_parcela, fecha, hora_inicio, hora_fin, completado) VALUES
    (2, 2, '2026-06-16', '08:00:00', '08:30:00', 1),  -- Juan   P-02, completó ayer
    (3, 3, '2026-06-16', '08:30:00', '09:00:00', 1),  -- María  P-03, completó ayer
    (4, 4, '2026-06-17', '08:00:00', '08:30:00', 0),  -- Pedro  P-04, hoy
    (5, 5, '2026-06-17', '08:30:00', '09:00:00', 0),  -- Ana    P-05, hoy
    (6, 6, '2026-06-18', '08:00:00', '08:30:00', 0),  -- Luis   P-06, mañana
    (7, 7, '2026-06-18', '08:30:00', '09:00:00', 0),  -- Rosa   P-07, mañana
    (8, 8, '2026-06-19', '08:00:00', '08:30:00', 0),  -- Carlos P-08
    (9, 9, '2026-06-19', '08:30:00', '09:00:00', 0),  -- Sofía  P-09
    (2, 2, '2026-06-20', '08:00:00', '08:30:00', 0),  -- Juan   P-02, próxima semana
    (3, 3, '2026-06-20', '08:30:00', '09:00:00', 0);  -- María  P-03, próxima semana

-- -------------------------------------------------------------
-- Actividades registradas
-- -------------------------------------------------------------
INSERT INTO actividades (id_parcela, id_usuario, tipo, descripcion, fecha) VALUES
    (2, 2, 'riego',           'Riego matutino con manguera, duración 20 min',          '2026-06-16 08:15:00'),  -- P-02 Juan
    (3, 3, 'riego',           'Riego matutino completo',                                '2026-06-16 08:45:00'),  -- P-03 María
    (2, 2, 'fertilizacion',   'Aplicación de compost casero alrededor del tomate',     '2026-06-14 09:00:00'),  -- P-02 Juan
    (4, 4, 'control_plagas',  'Se detectaron pulgones en la zanahoria, se retiró manualmente', '2026-06-13 10:30:00'),  -- P-04 Pedro
    (6, 6, 'poda',            'Poda de guías laterales del pepino para mejorar aireación', '2026-06-12 09:15:00'),  -- P-06 Luis
    (8, 8, 'fertilizacion',   'Fertilizante líquido orgánico al zapallo',               '2026-06-11 08:30:00'),  -- P-08 Carlos
    (7, 7, 'riego',           'Riego de la espinaca antes de cosechar',                 '2026-06-08 08:00:00'),  -- P-07 Rosa
    (5, 5, 'otro',            'Trasplante de albahaca a macetero auxiliar',             '2026-06-10 11:00:00'),  -- P-05 Ana
    (2, 1, 'otro',            'Revisión general de la parcela de Juan, sin novedades', '2026-06-15 09:00:00');  -- P-02, registrado por admin

-- -------------------------------------------------------------
-- Cosechas realizadas
-- -------------------------------------------------------------
INSERT INTO cosechas (id_siembra, id_usuario, fecha, cantidad_kg, notas) VALUES
    (2, 2, '2026-05-16', 0.30, 'Cilantro fresco, muy aromático. Se repartió entre vecinos'),
    (3, 3, '2026-05-28', 1.20, 'Lechuga en óptimas condiciones'),
    (8, 7, '2026-05-08', 0.80, 'Espinaca bebé cosechada antes de que floreciera');

-- -------------------------------------------------------------
-- Notificaciones enviadas a los usuarios
-- -------------------------------------------------------------
INSERT INTO notificaciones (id_usuario, titulo, mensaje, tipo, leida) VALUES
    -- Para Juan
    (2, 'Turno de riego mañana',
        'Recuerda que mañana 17/06 tienes turno de riego en la Parcela P-02 a las 08:00.',
        'recordatorio', 1),
    (2, 'Revisión de tu parcela',
        'Doña Carmen revisó tu parcela el 15/06 y no encontró novedades. ¡Buen trabajo!',
        'info', 1),

    -- Para Pedro
    (4, 'Turno de riego HOY',
        'Hoy 17/06 tienes turno de riego en la Parcela P-04 a las 08:00. ¡No olvides registrarlo!',
        'recordatorio', 0),
    (4, 'Alerta: pulgones detectados',
        'Se detectaron pulgones en tu zanahoria el 13/06. Revisa el estado del cultivo.',
        'alerta', 0),

    -- Para Ana
    (5, 'Turno de riego HOY',
        'Hoy 17/06 tienes turno de riego en la Parcela P-05 a las 08:30.',
        'recordatorio', 0),

    -- Para Luis
    (6, 'Turno de riego mañana',
        'Mañana 18/06 te corresponde regar la Parcela P-06 a las 08:00.',
        'recordatorio', 0),

    -- Para todos (notificación general enviada por admin)
    (2, 'Reunión comunidad 20/06',
        'Doña Carmen convoca a reunión del huerto el viernes 20/06 a las 18:00 en la plaza central.',
        'info', 0),
    (3, 'Reunión comunidad 20/06',
        'Doña Carmen convoca a reunión del huerto el viernes 20/06 a las 18:00 en la plaza central.',
        'info', 0),
    (4, 'Reunión comunidad 20/06',
        'Doña Carmen convoca a reunión del huerto el viernes 20/06 a las 18:00 en la plaza central.',
        'info', 0),
    (5, 'Reunión comunidad 20/06',
        'Doña Carmen convoca a reunión del huerto el viernes 20/06 a las 18:00 en la plaza central.',
        'info', 0),
    (6, 'Reunión comunidad 20/06',
        'Doña Carmen convoca a reunión del huerto el viernes 20/06 a las 18:00 en la plaza central.',
        'info', 0),
    (7, 'Reunión comunidad 20/06',
        'Doña Carmen convoca a reunión del huerto el viernes 20/06 a las 18:00 en la plaza central.',
        'info', 0),
    (8, 'Reunión comunidad 20/06',
        'Doña Carmen convoca a reunión del huerto el viernes 20/06 a las 18:00 en la plaza central.',
        'info', 0),
    (9, 'Reunión comunidad 20/06',
        'Doña Carmen convoca a reunión del huerto el viernes 20/06 a las 18:00 en la plaza central.',
        'info', 0),

    -- Para Rosa - reporte de cosecha
    (7, 'Cosecha registrada',
        'Tu cosecha de espinaca del 08/05 quedó registrada: 0.80 kg. ¡Excelente resultado!',
        'info', 1);

-- =============================================================
-- FIN DEL SCRIPT
-- =============================================================
