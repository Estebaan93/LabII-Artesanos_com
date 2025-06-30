// models/notificacionModel.js
import pool from "../config/db.js";

// Obtener notificaciones NOP leidas de un usuario
export const obtenerNotificacionesNoLeidas = async (id_usuario) => {
  const sql = `
  SELECT 
    na.id_notificacion, 
    sa.id_solicitud AS id_solicitud, 
    'amistad' AS tipo, 
    u.nombre AS remitente, 
    sa.accion, 
    sa.id_destinatario, 
    sa.id_usuario AS remitente_id, 
    sa.id_solicitud AS ref_id
  FROM notificacion_amistad na
  JOIN solicitud_amistad sa ON na.id_solicitud = sa.id_solicitud
  JOIN usuario u ON sa.id_usuario = u.id_usuario
  WHERE na.id_usuario = ? AND sa.accion = 'pendiente'

  UNION ALL

  SELECT 
    na.id_notificacion, 
    sa.id_solicitud AS id_solicitud, 
    'aceptacion' AS tipo, 
    u2.nombre AS remitente, 
    sa.accion, 
    sa.id_destinatario, 
    sa.id_usuario AS remitente_id, 
    sa.id_solicitud AS ref_id
  FROM notificacion_amistad na
  JOIN solicitud_amistad sa ON na.id_solicitud = sa.id_solicitud
  JOIN usuario u2 ON sa.id_usuario = u2.id_usuario  -- REMITENTE (quien aceptó)
  WHERE na.id_usuario = ? AND sa.accion = 'aceptar' AND sa.id_destinatario = ?

  UNION ALL

  SELECT 
    nc.id_notificacion, 
    NULL AS id_solicitud, 
    'comentario' AS tipo, 
    u.nombre AS remitente, 
    NULL AS accion, 
    NULL AS id_destinatario, 
    c.id_usuario AS remitente_id, 
    c.id_imagen AS ref_id
  FROM notificacion_contenido nc
  JOIN comentarios c ON nc.id_comentario = c.id_comentario
  JOIN usuario u ON c.id_usuario = u.id_usuario
  WHERE nc.id_notificacion IS NOT NULL
  ORDER BY id_notificacion DESC
`;

  const [rows] = await pool.query(sql, [id_usuario, id_usuario, id_usuario]);
  return rows;
};


export const insertarNotificacionAmistad = async ({ id_solicitud, id_usuario }) => {
  const [result] = await pool.query(`
    INSERT INTO notificacion_amistad (id_solicitud, id_usuario)
    VALUES (?, ?)`,
    [id_solicitud, id_usuario]
  );
  return result.insertId;
};



/*export const insertarNotificacionAmistad = async ({ id_solicitud, id_usuario }) => {
  const [result] = await pool.query(`
    INSERT INTO notificacion_amistad (id_solicitud, id_usuario) VALUES (?, ?)
  `, [id_solicitud, id_usuario]);
  return result.insertId;
};*/


export const insertarNotificacionContenido = async ({ id_comentario, id_usuario }) => {
  const [result] = await pool.query(`
    INSERT INTO notificacion_contenido (id_comentario, id_usuario) VALUES (?, ?)
  `, [id_comentario, id_usuario]);
  return result.insertId;
};

// Marcar noti como leida (borrar)
export const marcarNotificacionLeida = async (id_notificacion) => {
 
  const [res1] = await pool.query('DELETE FROM notificacion_amistad WHERE id_notificacion = ?', [id_notificacion]);
  const [res2] = await pool.query('DELETE FROM notificacion_contenido WHERE id_notificacion = ?', [id_notificacion]);
  return res1.affectedRows > 0 || res2.affectedRows > 0;
};
