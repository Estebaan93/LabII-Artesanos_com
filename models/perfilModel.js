import pool from '../config/db.js';

export const obtenerDatosUsuario = async (id_usuario) => {
  const [rows] = await pool.query(
    'SELECT * FROM usuario WHERE id_usuario = ?',
    [id_usuario]
  );
  return rows[0];
};

export const obtenerFormacionesUsuario = async (id_usuario) => {
  const [rows] = await pool.query(
    `SELECT uf.*, f.tipo AS tipo_formacion
     FROM usuario_formacion uf
     JOIN formacion f ON uf.id_formacion = f.id_formacion
     WHERE uf.id_usuario = ?`,
    [id_usuario]
  );
  return rows;
};

export const obtenerInteresesUsuario = async (id_usuario) => {
  const [rows] = await pool.query(
    `SELECT ti.*, i.tipo
     FROM tipo_interes ti
     JOIN intereses i ON ti.id_interes = i.id_interes
     WHERE ti.id_usuario = ?`,
    [id_usuario]
  );
  return rows;
};

/**
 * Actualiza los datos del usuario y reemplaza todas sus formaciones
 * @param {number} id_usuario 
 * @param {Object} datos 
 *  - nombre
 *  - apellido
 *  - email
 *  - avatarUrl
 *  - formaciones: array de objetos con tipo, fecha, institucion, descripcion
 */
export const actualizarDatosUsuario = async (id_usuario, datos) => {
  const { nombre, apellido, email, avatarUrl, formaciones } = datos;

  // Actualizar datos del usuario
  await pool.query(
    `UPDATE usuario 
     SET nombre = ?, apellido = ?, email = ?, avatarUrl = ?
     WHERE id_usuario = ?`,
    [nombre, apellido, email, avatarUrl, id_usuario]
  );

  // Eliminar formaciones anteriores
  await pool.query(
    'DELETE FROM usuario_formacion WHERE id_usuario = ?',
    [id_usuario]
  );

  // Insertar nuevas formaciones (si las hay)
  for (const f of formaciones) {
    const { tipo, fecha, institucion, descripcion } = f;

    // Obtener id_formacion a partir del tipo
    const [formacionRows] = await pool.query(
      'SELECT id_formacion FROM formacion WHERE tipo = ?',
      [tipo]
    );

    if (formacionRows.length === 0) {
      throw new Error(`Formación no válida: ${tipo}`);
    }

    const id_formacion = formacionRows[0].id_formacion;

    // Insertar nueva formación
    await pool.query(
      `INSERT INTO usuario_formacion 
        (id_usuario, id_formacion, fecha, institucion, descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      [id_usuario, id_formacion, fecha, institucion, descripcion]
    );
  }
};
