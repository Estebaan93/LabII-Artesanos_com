//models/usuarioModel.js

import pool from "../config/db.js";

//Obtener todos los usuarios
export const obtenerUsuarios = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuario');
    return rows;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

//Insertar un nuevo usuario
export const insertarUsuario = async ({ nombre, apellido, email, password, avatarUrl, estado }) => {
  const [result] = await pool.query(
    `INSERT INTO usuario (nombre, apellido, email, password, avatarUrl,fecha,  estado) VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
    [nombre, apellido, email, password, avatarUrl, estado] 
  );
  return result.insertId;
};



//Eliminar usuario
export const eliminarUsuario = async (id_usuario) => {
  try {
    await pool.query(`DELETE FROM usuario WHERE id_usuario= ?`, [id_usuario]);
    return true;
  } catch (error) {
    console.error(`Error al eliminar usuario: ${error}`)
    throw error;
  }
}

//Actualizar usuario
export const actualizarUsuario = async (id_usuario, datos) => {
  try {
    const { nombre, apellido, email, password, estado, img_perfil } = datos;
    await pool.query(
      `UPDATE usuario SET nombre = ?, apellido = ?, email = ?, password = ?, estado = ?, img_perfil = ? WHERE id_usuario = ?`,
      [nombre, apellido, email, password, estado, img_perfil, id_usuario]
    );
    return true;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

// Obtener un usuario por su ID
export const obtenerUsuarioPorId = async (id_usuario) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuario WHERE id_usuario = ?', [id_usuario]);
    return rows.length ? rows[0] : null;
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    throw error;
  }
};


// Obtener usuario por email
export const obtenerUsuarioPorEmail = async (email) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
    return rows.length ? rows[0] : null;
  } catch (error) {
    console.error('Error al buscar usuario por email:', error);
    throw error;
  }
};



export const obtenerUsuariosExcepto = async (id_usuario) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuario WHERE id_usuario != ?', [id_usuario]);
    return rows;
  } catch (error) {
    console.error('Error al obtener usuarios excepto el actual:', error);
    throw error;
  }
};

export const obtenerUsuarioPorNombreYApellido = async (nombre, apellido) => {
  const [rows] = await pool.query(
    "SELECT * FROM usuario WHERE nombre = ? AND apellido = ? LIMIT 1",
    [nombre, apellido]
  );
  return rows[0] || null;
};


export async function buscarUsuariosDisponibles(id_usuario, nombre) {
  const [usuarios] = await pool.query(
    `
    SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.avatarUrl
    FROM usuario u
    WHERE u.estado = 1
      AND (u.nombre LIKE ? OR u.apellido LIKE ?)
      AND u.id_usuario != ?
      -- No mostrar usuarios a quienes yo YA les envié solicitud
      AND u.id_usuario NOT IN (
        SELECT id_destinatario
        FROM solicitud_amistad
        WHERE id_usuario = ? AND accion = 'pendiente'
      )
      -- No mostrar usuarios a quienes yo ya agregué como amigo (unidireccional)
      AND u.id_usuario NOT IN (
        SELECT amigo_id
        FROM amigos
        WHERE id_usuario = ? AND estado = 1
      )
    `,
    [
      `%${nombre}%`, `%${nombre}%`,
      id_usuario,
      id_usuario,  // Para solicitudes
      id_usuario   // Para amistades
    ]
  );

  return usuarios;
}
