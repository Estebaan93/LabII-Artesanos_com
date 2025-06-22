import {crearAlbum, obtenerAlbumDeUsuario, obtenerAlbumPorId, eliminarAlbumPorId } from '../models/albumModel.js';
import {obtenerImagenesDeAlbum,obtenerImagenesVisibles } from '../models/imagenModel.js';

// Listar 
export const listarAlbumes = async (req, res) => {
  try {
    const id_usuario = req.session.usuario.id_usuario;
    const albumes = await obtenerAlbumDeUsuario(id_usuario);

    const albumConPortada = await Promise.all(
      albumes.map(async (album) => {
        const imagenes = await obtenerImagenesDeAlbum(album.id_album);
        const portada = imagenes.length > 0 ? imagenes[0].imagen : null;
        return { ...album, portada };
      })
    );

    res.render('albumes/index', { albumes: albumConPortada });
  } catch (error) {
    console.error(`Error al obtener álbumes: ${error}`);
    res.status(500).send('Error al obtener álbumes');
  }
};

// Mostrar formulario 
export const mostrarFormularioCrear = (req, res) => {
  res.render('albumes/nuevo');
};

// Crear album (POST)
export const crearAlbumPost = async (req, res) => {
  try {
    const id_usuario = req.session.usuario.id_usuario;
    const { titulo } = req.body;
    await crearAlbum({ id_usuario, titulo });
    res.redirect('/albumes');
  } catch (error) {
    res.status(500).send('Error al crear álbum');
  }
};

// Mostrar detalles alb
export const verAlbum = async (req, res) => {
  try {
    const id_album = req.params.id_album;
    const id_usuario_consultante = req.session.usuario.id_usuario;

    const album = await obtenerAlbumPorId(id_album);
    if (!album) return res.status(404).send('Álbum no encontrado');

    // Logs para comparar si el usuario que consulta es el propietario
    console.log("Propietario del álbum:", album.id_usuario);
    console.log("Consultante:", id_usuario_consultante);

    const imagenes = await obtenerImagenesVisibles(id_album, id_usuario_consultante);

   //consulto
    console.log('Visibilidades recibidas:', imagenes.map(img => img.visibilidad));
    console.log('Total de imágenes recibidas:', imagenes.length);
    console.log('Imágenes completas:', imagenes);

    res.render('albumes/detalle', { album, imagenes });
  } catch (error) {
    console.error('Error en verAlbum:', error);
    res.status(500).send('Error al obtener el álbum');
  }
};


export const eliminarAlbum = async (req, res) => {
  try {
    const id_album = req.params.id_album;
    const eliminado = await eliminarAlbumPorId(id_album);
    if (eliminado) {
      res.status(200).send('Álbum eliminado');
    } else {
      res.status(404).send('Álbum no encontrado');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar álbum');
  }
};
