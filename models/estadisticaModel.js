//models/estadisticaModels.js
import pool from "../config/db.js";

// Cantidad de álbumes del usuario
export const contarAlbumesUsuario = async (id_usuario) => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS cantidad FROM album WHERE id_usuario = ?",
    [id_usuario]
  );
  return rows[0].cantidad || 0;
};

// Cantidad de imágenes del usuario
export const contarImagenesUsuario = async (id_usuario) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cantidad FROM imagen 
     WHERE id_album IN (SELECT id_album FROM album WHERE id_usuario = ?)`,
    [id_usuario]
  );
  return rows[0].cantidad || 0;
};

// Cantidad de comentarios recibidos (en todas sus imágenes)
export const contarComentariosRecibidos = async (id_usuario) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cantidad FROM comentarios c
     INNER JOIN imagen i ON c.id_imagen = i.id_imagen
     INNER JOIN album a ON i.id_album = a.id_album
     WHERE a.id_usuario = ?`,
    [id_usuario]
  );
  return rows[0].cantidad || 0;
};
