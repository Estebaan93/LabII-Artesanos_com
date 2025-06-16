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