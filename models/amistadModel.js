// models/amistadModel.js
import pool from "../config/db.js";

// Devuelve la lista de amigos aceptados para un usuario
export const obtenerAmigosDeUsuario = async (id_usuario) => {
  // Cambia los nombres de las tablas/campos según tu modelo real
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.apellido, u.avatarUrl
     FROM amigos a
     JOIN usuario u ON u.id_usuario = (
       CASE
         WHEN a.id_usuario = ? THEN a.amigo_id
         ELSE a.id_usuario
       END
     )
     WHERE (a.id_usuario = ? OR a.amigo_id = ?)
       AND a.estado = 1`, // estado=1: aceptado
    [id_usuario, id_usuario, id_usuario]
  );
  return rows;
};
