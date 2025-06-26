//models/albumModel.js
import pool from '../config/db.js';

//Obtener todos los albumes de un usuario
export const obtenerAlbumDeUsuario= async(id_usuario)=>{
	const [rows] = await pool.query(`
		SELECT * FROM album WHERE id_usuario = ? ORDER BY fecha DESC
	`, [id_usuario]);
	return rows;
};


//Crear un nuevo album
export const crearAlbum = async ({ id_usuario, titulo }) => {
  const [result] = await pool.query(
    `INSERT INTO album (id_usuario, titulo, fecha) VALUES (?, ?, NOW())`,
    [id_usuario, titulo]
  );
  return result.insertId;
};


export const obtenerAlbumPorId = async (id_album) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM album WHERE id_album = ?
    `, [id_album]);
    return rows.length ? rows[0] : null;
  } catch (error) {
    console.error('Error al obtener álbum:', error);
    throw new Error('No se pudo recuperar el álbum.');
  }
};


export const eliminarAlbumPorId = async (id_album) => {
  const [result] = await pool.query('DELETE FROM album WHERE id_album = ?', [id_album]);
  return result.affectedRows > 0;
};


