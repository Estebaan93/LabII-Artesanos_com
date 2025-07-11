// models/comentarioModel.js
import pool from "../config/db.js";

// Obtener comentarios de una imagen
export const obtenerComentariosDeImagen = async (id_imagen) => {
  const [rows] = await pool.query(
    `SELECT c.id_comentario, c.descripcion, u.nombre AS usuario
     FROM comentarios c
     JOIN usuario u ON c.id_usuario = u.id_usuario
     WHERE c.id_imagen = ?
     ORDER BY c.id_comentario DESC`,
    [id_imagen]
  );
  return rows;
};

// Agregar nuevo comentario y devolver el id insertado
export const agregarComentario = async ({ id_imagen, id_usuario, descripcion }) => {
  const [result] = await pool.query(
    `INSERT INTO comentarios (id_imagen, id_usuario, descripcion) VALUES (?, ?, ?)`,
    [id_imagen, id_usuario, descripcion]
  );
  return result.insertId; // Devuelve el ID del comentario creado
};