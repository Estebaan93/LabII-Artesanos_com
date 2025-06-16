// controllers/imagenController.js
import { insertarImagen, asociarImagenAlbum, obtenerValoresEnumVisibilidad, obtenerPortadaPorAlbum } from "../models/imagenModel.js";

// Mostrar formulario para subir imagen
export const mostrarFormularioSubir = async (req, res) => {
  const id_album = req.params.id_album;


  const visibilidades = await obtenerValoresEnumVisibilidad();

  // Renderizar envio opcion y id
  res.render('obras/nueva', {
    id_album,
    visibilidades
  });
};

// Procesar subida de imagen
export const procesarSubidaImagen = async (req, res) => {
  try {
    const id_album = req.params.id_album;
    console.log('id_album recibido:', id_album);

    const { titulo, visibilidad, imagen_url } = req.body;
    let imagen = null;

    if (req.file && req.file.filename) {
      imagen = req.file.filename;
    } else if (imagen_url && imagen_url.trim()) {
      imagen = imagen_url.trim();
    }

    if (!imagen) {
      return res.status(400).send('Debe subir un archivo o ingresar una URL.');
    }

    if (!id_album) {
      return res.status(400).send('El id_album es obligatorio y no puede ser nulo.');
    }

    // Insertar la imagen en la tabla `imagen`
    const id_imagen = await insertarImagen({
      imagen,
      titulo,
      visibilidad: visibilidad || 'personal',
      id_album
    });

    // Asociar a la tabla intermedia si hace falta
    await asociarImagenAlbum(id_album, id_imagen);


    // Redirigir al álbum
    res.redirect(`/albumes/${id_album}`);

  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).send('Error al subir la imagen');
  }
};