-- =============================================================
-- MIGRACIÓN: Reasignación de números de parcela
-- Aplica sobre la BD activa sin necesidad de DROP/recrear.
-- Resultado: P-01 → Carmen, P-02 → Juan, ..., P-09 → Sofía, P-10 disponible
-- =============================================================

USE huerto_vivo;

-- Desactivar FK checks para renombrar números sin conflictos UNIQUE
SET FOREIGN_KEY_CHECKS = 0;

-- Paso 1: renombrar con prefijo temporal para evitar conflictos entre sí
UPDATE parcelas SET numero = 'P-TMP-02' WHERE numero = 'P-01';  -- Juan
UPDATE parcelas SET numero = 'P-TMP-03' WHERE numero = 'P-02';  -- María
UPDATE parcelas SET numero = 'P-TMP-04' WHERE numero = 'P-03';  -- Pedro
UPDATE parcelas SET numero = 'P-TMP-05' WHERE numero = 'P-04';  -- Ana
UPDATE parcelas SET numero = 'P-TMP-06' WHERE numero = 'P-05';  -- Luis
UPDATE parcelas SET numero = 'P-TMP-07' WHERE numero = 'P-06';  -- Rosa
UPDATE parcelas SET numero = 'P-TMP-08' WHERE numero = 'P-07';  -- Carlos
UPDATE parcelas SET numero = 'P-TMP-09' WHERE numero = 'P-08';  -- Sofía
UPDATE parcelas SET numero = 'P-TMP-10' WHERE numero = 'P-09';  -- Disponible

-- Paso 2: aplicar nombres finales
UPDATE parcelas SET numero = 'P-02' WHERE numero = 'P-TMP-02';
UPDATE parcelas SET numero = 'P-03' WHERE numero = 'P-TMP-03';
UPDATE parcelas SET numero = 'P-04' WHERE numero = 'P-TMP-04';
UPDATE parcelas SET numero = 'P-05' WHERE numero = 'P-TMP-05';
UPDATE parcelas SET numero = 'P-06' WHERE numero = 'P-TMP-06';
UPDATE parcelas SET numero = 'P-07' WHERE numero = 'P-TMP-07';
UPDATE parcelas SET numero = 'P-08' WHERE numero = 'P-TMP-08';
UPDATE parcelas SET numero = 'P-09' WHERE numero = 'P-TMP-09';
UPDATE parcelas SET numero = 'P-10' WHERE numero = 'P-TMP-10';

-- Paso 3: insertar la nueva P-01 de Carmen
INSERT INTO parcelas (numero, descripcion, tamanio_m2, estado, id_usuario)
VALUES ('P-01', 'Parcela comunitaria, sector coordinación', 5.00, 'ocupada', 1);

SET FOREIGN_KEY_CHECKS = 1;

-- Paso 4: corregir textos de notificaciones que mencionan números de parcela
UPDATE notificaciones
SET mensaje = REPLACE(mensaje, 'Parcela P-01', 'Parcela P-02')
WHERE id_usuario = 2 AND mensaje LIKE '%Parcela P-01%';

UPDATE notificaciones
SET mensaje = REPLACE(mensaje, 'Parcela P-03', 'Parcela P-04')
WHERE id_usuario = 4 AND mensaje LIKE '%Parcela P-03%';

UPDATE notificaciones
SET mensaje = REPLACE(mensaje, 'Parcela P-04', 'Parcela P-05')
WHERE id_usuario = 5 AND mensaje LIKE '%Parcela P-04%';

UPDATE notificaciones
SET mensaje = REPLACE(mensaje, 'Parcela P-05', 'Parcela P-06')
WHERE id_usuario = 6 AND mensaje LIKE '%Parcela P-05%';

-- Verificación final
SELECT numero, descripcion, estado, id_usuario FROM parcelas ORDER BY numero;
