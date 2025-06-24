// models/solicitudModel.js
import pool from '../config/db.js';

export const insertarSolicitudAmistad = async ({ id_usuario, id_destinatario, accion }) => {
  const [result] = await pool.query(
    'INSERT INTO solicitud_amistad (id_usuario, id_destinatario, accion) VALUES (?, ?, ?)',
    [id_usuario, id_destinatario, accion]
  );
  return result.insertId;
};

export const actualizarSolicitudAmistadPorId = async ({ id_solicitud, accion }) => {
  const [result] = await pool.query(
    'UPDATE solicitud_amistad SET accion = ? WHERE id_solicitud = ?',
    [accion, id_solicitud]
  );
  return result.affectedRows;
};

export const obtenerUsuariosDeSolicitud = async (id_solicitud) => {
  const [rows] = await pool.query(
    'SELECT id_usuario, id_destinatario FROM solicitud_amistad WHERE id_solicitud = ?',
    [id_solicitud]
  );
  return rows[0];
};

export const obtenerEstadoAmistad = async (id_usuario, id_destinatario) => {
  const [rows] = await pool.query(
    `SELECT accion FROM solicitud_amistad 
     WHERE (id_usuario = ? AND id_destinatario = ?) 
        OR (id_usuario = ? AND id_destinatario = ?) 
     ORDER BY id_solicitud DESC LIMIT 1`,
    [id_usuario, id_destinatario, id_destinatario, id_usuario]
  );
  return rows.length ? rows[0].accion : null;
};

// Devuelve amigos donde YO le envié la solicitud y fue aceptada
export const obtenerAmigosEnviadosYAceptados = async (id_usuario) => {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.apellido, u.avatarUrl
     FROM solicitud_amistad s
     JOIN usuario u ON u.id_usuario = s.id_destinatario
     WHERE s.id_usuario = ? AND s.accion IN ('aceptar', 'aceptado')`,
    [id_usuario]
  );
  return rows;
};


// Solo consulta solicitud de este usuario a ese destinatario
export const obtenerEstadoSolicitudDirecta = async (id_usuario, id_destinatario) => {
  const [rows] = await pool.query(
    `SELECT accion FROM solicitud_amistad 
     WHERE id_usuario = ? AND id_destinatario = ? 
     ORDER BY id_solicitud DESC LIMIT 1`,
    [id_usuario, id_destinatario]
  );
  return rows.length ? rows[0].accion : null;
};
