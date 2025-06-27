// models/imagenModel.js
import pool from "../config/db.js";

// Sin id_album
export const insertarImagen = async ({ imagen, titulo, visibilidad, id_album }) => {
  if (!id_album) throw new Error('El id_album es obligatorio y no puede ser nulo');
  const [result] = await pool.query(
    'INSERT INTO imagen (imagen, titulo, visibilidad, id_album, fecha) VALUES (?, ?, ?, ?, CURDATE())',
    [imagen, titulo, visibilidad, id_album]
  );
  return result.insertId;
};
// Asociar imagen a un álbum (tabla intermedia album_imagen) para compartir
export const asociarImagenAlbum = async (id_album, id_imagen) => {
  try {
    const [rows] = await pool.query(
      'SELECT 1 FROM album_imagen WHERE id_album = ? AND id_imagen = ?',
      [id_album, id_imagen]
    );

    if (rows.length === 0) {
      await pool.query(
        'INSERT INTO album_imagen (id_album, id_imagen, fecha_agregado) VALUES (?, ?, CURDATE())',
        [id_album, id_imagen]
      );
    }
  } catch (error) {
    console.error('Error en asociarImagenAlbum:', error);
    throw error;
  }
};

// Obtener todas las imagenes de un álbum (propias + compartidas)
export const obtenerImagenesDeAlbum = async (id_album) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT i.* FROM imagen i
     LEFT JOIN album_imagen ai ON i.id_imagen = ai.id_imagen
     WHERE i.id_album = ? OR ai.id_album = ?`,
    [id_album, id_album]
  );
  return rows;
};

// Obtener una imagen por id (opcional)
export const obtenerImagenPorId = async (id_imagen) => {
  const [rows] = await pool.query(
    'SELECT * FROM imagen WHERE id_imagen = ?',
    [id_imagen]
  );
  return rows[0] || null;
};

export const obtenerImagenesVisibles = async (id_album, id_usuario_consultante) => {
  console.log('id_album:', id_album, 'id_usuario_consultante:', id_usuario_consultante);

  const [albumRows] = await pool.query(
    'SELECT id_usuario FROM album WHERE id_album = ?',
    [id_album]
  );
  if (albumRows.length === 0) {
    console.log('No se encontró el álbum');
    return [];
  }

  const id_usuario_propietario = albumRows[0].id_usuario;
  console.log('id_usuario_propietario:', id_usuario_propietario);

  const propietario = Number(id_usuario_propietario);
  const consultante = Number(id_usuario_consultante);

  console.log('Comparando propietario y consultante:', propietario, consultante);

  if (consultante === propietario) {
    console.log('¡El consultante es el propietario!');

    const visibilidadesPermitidas = ['personal', 'amigos', 'mejores_amigos', 'publico', 'personalizada'];
    console.log('Visibilidades permitidas para propietario:', visibilidadesPermitidas);

    const placeholders = visibilidadesPermitidas.map(() => '?').join(',');

    const [rows] = await pool.query(
      `SELECT DISTINCT i.* FROM imagen i
       LEFT JOIN album_imagen ai ON i.id_imagen = ai.id_imagen
       WHERE (i.id_album = ? OR ai.id_album = ?) AND i.visibilidad IN (${placeholders})`,
      [id_album, id_album, ...visibilidadesPermitidas]
    );
    console.log('Cantidad imágenes obtenidas:', rows.length);
    return rows;
  }

  console.log('El consultante NO es el propietario');

  // Consulta real a la tabla amigos según tu estructura
  const obtenerNivelAmistad = async (id_consultante, id_propietario) => {
    const [rows] = await pool.query(
      `SELECT nivel FROM amigos 
       WHERE estado = 1 AND (
         (id_usuario = ? AND amigo_id = ?) OR 
         (id_usuario = ? AND amigo_id = ?)
       )`,
      [id_consultante, id_propietario, id_propietario, id_consultante]
    );
    if (rows.length > 0) {
      return rows[0].nivel; 
    }
    return null;
  };

  const nivelAmistad = await obtenerNivelAmistad(consultante, propietario);
  console.log('Nivel de amistad:', nivelAmistad);

  let visibilidadesPermitidas = ['publico'];

  if (nivelAmistad === 'mejores_amigos') {
    visibilidadesPermitidas.push('amigos', 'mejores_amigos', 'personalizada');
  } else if (nivelAmistad === 'amigos') {
    visibilidadesPermitidas.push('amigos', 'personalizada');
  }
  console.log('Visibilidades permitidas para no propietario:', visibilidadesPermitidas);

  const placeholders = visibilidadesPermitidas.map(() => '?').join(',');

  const [rows] = await pool.query(
    `SELECT DISTINCT i.* FROM imagen i
     LEFT JOIN album_imagen ai ON i.id_imagen = ai.id_imagen
     WHERE (i.id_album = ? OR ai.id_album = ?) AND i.visibilidad IN (${placeholders})`,
    [id_album, id_album, ...visibilidadesPermitidas]
  );

  console.log('Cantidad imágenes obtenidas:', rows.length);
  return rows;
};


// Obtener los valores posibles del ENUM 'visibilidad' de la tabla 'imagen'
export const obtenerValoresEnumVisibilidad = async () => {
  const [rows] = await pool.query("SHOW COLUMNS FROM imagen LIKE 'visibilidad'");
  const enumStr = rows[0].Type; 
  const valores = enumStr.match(/enum\((.*)\)/)[1];
  return valores.split(',').map(valor => valor.replace(/'/g, ""));
};


export const obtenerImagenesPorVisibilidad = async (id_usuario, visibilidad) => {
  // Primero obtener todos album
  const [albumes] = await pool.query(
    'SELECT id_album FROM album WHERE id_usuario = ?',
    [id_usuario]
  );
  
  if (albumes.length === 0) return [];

 
  const ids_albumes = albumes.map(a => a.id_album);


  const [imagenes] = await pool.query(
    `SELECT i.* FROM imagen i
     LEFT JOIN album_imagen ai ON i.id_imagen = ai.id_imagen
     WHERE (i.id_album IN (?) OR ai.id_album IN (?)) AND i.visibilidad = ?`,
    [ids_albumes, ids_albumes, visibilidad]
  );

  return imagenes;
};
export const obtenerPortadaPorAlbum = async (id_album) => {
  const [imagenes] = await pool.query(
    `SELECT imagen FROM imagen 
     WHERE id_album = ? 
     ORDER BY id_imagen ASC 
     LIMIT 1`,
    [id_album]
  );

  if (imagenes.length > 0) {
    return imagenes[0].imagen;  // devuelve el nombre o URL de la imagen
  } else {
    return null;
  }
};


//Eliminar imagen y dependencias
export const eliminarImagenPorId= async(id_imagen)=>{
  const conn= await pool.getConnection();
  try{
    await conn.beginTransaction();
  
    //Eliminar de album_imgane
    await conn.query('DELETE FROM album_imagen WHERE id_imagen = ?',[id_imagen]);

    //Eliminar comentarios de la imagen
    await conn.query('DELETE FROM comentarios WHERE id_imagen = ?', [id_imagen]);

    //Eliminar la imagen
    await conn.query('DELETE FROM imagen WHERE id_imagen = ?', [id_imagen]);

    await conn.commit();
    return true;    
  }catch(error){
    console.error(`Error al eliminar imagen ${error}`)
    await conn.rollback();
    throw error;
  }finally{
    conn.release();
  }
}
