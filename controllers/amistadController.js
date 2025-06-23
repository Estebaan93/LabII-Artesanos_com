// controllers/amistadController.js
import { obtenerAlbumDeUsuario } from "../models/albumModel.js";
import { obtenerImagenesVisibles } from "../models/imagenModel.js";
import { obtenerUsuarioPorId } from "../models/usuarioModel.js";

export const verGaleriaAmigo = async (req, res) => {
  try {
    const id_usuario_propietario = req.params.id_usuario; // el amigo
    const id_usuario_consultante = req.session.usuario.id_usuario; // el que está viendo

    // Traer datos del amigo
    const usuario = await obtenerUsuarioPorId(id_usuario_propietario);
    if (!usuario) return res.status(404).send('Usuario no encontrado');

    // Traer todos los álbumes del amigo
    const albumes = await obtenerAlbumDeUsuario(id_usuario_propietario);

    // Traer todas las imágenes permitidas (dentro de cada álbum)
    let imagenes = [];
    for (const album of albumes) {
      const imgs = await obtenerImagenesVisibles(album.id_album, id_usuario_consultante);
      imagenes = imagenes.concat(imgs);
    }

    // ÁLBUM VIRTUAL para la vista
    const album = {
      id_album: 0,
      titulo: `Galería de amistad de ${usuario.nombre} ${usuario.apellido}`,
      id_usuario: id_usuario_propietario
    };

    res.render('albumes/detalle', {
      album,
      imagenes,
      usuario, //El dueño de la galeria (amigo)
      usuarioSesion: req.session.usuario, //El logueado
      galeriaAmistad: true
    });
  } catch (error) {
    console.error('Error al mostrar galería de amistad:', error);
    res.status(500).send('Error al mostrar galería de amistad');
  }
};
