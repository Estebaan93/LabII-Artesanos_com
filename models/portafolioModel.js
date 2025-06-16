// models/portafolioModel.js
import pool from '../config/db.js';

// Obtener usuarios que tienen al menos una imagen pública
export const obtenerUsuariosConImagenPublica = async () => {
  const [rows] = await pool.query(`
    SELECT DISTINCT u.id_usuario, u.nombre, u.apellido, u.avatarUrl
    FROM usuario u
    JOIN album a ON u.id_usuario = a.id_usuario
    JOIN imagen i ON a.id_album = i.id_album
    WHERE i.visibilidad = 'publico' AND u.estado = 1
  `);
  return rows;
};

/*SELECT i.id_imagen, i.titulo, i.visibilidad, a.id_album, a.id_usuario
FROM imagen i
JOIN album a ON i.id_album = a.id_album
WHERE i.visibilidad = 'publico';*/
/**/

// Obtener álbumes que tienen imágenes públicas para un usuario
export const obtenerAlbumesPublicosPorUsuario = async (id_usuario) => {
  const [rows] = await pool.query(`
    SELECT DISTINCT a.id_album, a.titulo
    FROM album a
    JOIN imagen i ON a.id_album = i.id_album
    WHERE a.id_usuario = ? AND i.visibilidad = 'publico'
  `, [id_usuario]);
  return rows;
};

// Obtener imágenes públicas de un álbum
export const obtenerImagenesPublicasPorAlbum = async (id_album) => {
  const [rows] = await pool.query(`
    SELECT *
    FROM imagen
    WHERE id_album = ? AND visibilidad = 'publico'
  `, [id_album]);
  return rows;
};
