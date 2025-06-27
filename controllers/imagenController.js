// controllers/imagenController.js
import {insertarImagen, asociarImagenAlbum, obtenerValoresEnumVisibilidad, obtenerPortadaPorAlbum, eliminarImagenPorId} from "../models/imagenModel.js";

// Mostrar formulario para subir imagen
export const mostrarFormularioSubir = async (req, res) => {
  const id_album = req.params.id_album;

  const visibilidades = await obtenerValoresEnumVisibilidad();

  // Renderizar envio opcion y id
  res.render('obras/nueva', {
    id_album,
    visibilidades,
    usuarioSesion: req.session.usuario
  });
};

// Procesar subida de imagen
export const procesarSubidaImagen = async (req, res) => {
  try {
    const id_album = req.params.id_album;
    const { titulo, visibilidad, imagen_url } = req.body;

    // Si subió archivos
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const id_imagen = await insertarImagen({
          imagen: file.filename,
          titulo,
          visibilidad: visibilidad || 'personal',
          id_album
        });
        await asociarImagenAlbum(id_album, id_imagen);
      }
      return res.redirect(`/albumes/${id_album}`);
    }
    // Si no, procesar URL (opcional, sólo si no subió archivos)
    if (imagen_url && imagen_url.trim()) {
      const id_imagen = await insertarImagen({
        imagen: imagen_url.trim(),
        titulo,
        visibilidad: visibilidad || 'personal',
        id_album
      });
      await asociarImagenAlbum(id_album, id_imagen);
      return res.redirect(`/albumes/${id_album}`);
    }
    // Si no subió nada
    return res.status(400).send('Debe subir uno o más archivos o ingresar una URL.');

  } catch (error) {
    console.error('Error al subir imagen:', error);

        // Detectar el error de trigger de límite
    if (
      error.code === 'ER_SIGNAL_EXCEPTION' &&
      error.sqlMessage &&
      error.sqlMessage.includes('álbum no puede contener más de 20 imágenes')
    ) {
      // Renderiza la vista con el mensaje y el id_album para redirigir
      return res.status(400).render('error_generico', {
        mensaje: '¡El álbum no puede contener más de 20 imágenes!',
        id_album: req.params.id_album
      });
    }

    res.status(500).send('Error al subir la imagen');
  }
};

export const eliminarImagen= async (req, res)=>{
  try{
    const {id_album, id_imagen}= req.params;
    await eliminarImagenPorId(id_imagen);
    res.redirect(`/albumes/${id_album}`); //Rederigimos al album
  }catch(err){
    console.error(`Erro al elimnar la imagen ${err}`);
    res.status(500).send("No se pudo eliminar la imagen");
  }
}
