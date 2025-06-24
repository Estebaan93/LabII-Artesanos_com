//controllers/albumController.js
import {crearAlbum, obtenerAlbumDeUsuario, obtenerAlbumPorId, eliminarAlbumPorId } from '../models/albumModel.js';
import {obtenerImagenesDeAlbum,obtenerImagenesVisibles } from '../models/imagenModel.js';
import {obtenerUsuarioPorNombreYApellido} from '../models/usuarioModel.js'
import {obtenerAmigosEnviadosYAceptados} from '../models/solicitudModel.js'

// Listar 
export const listarAlbumes = async (req, res) => {
  try {
    const id_usuario = req.session.usuario.id_usuario;
    const albumes = await obtenerAlbumDeUsuario(id_usuario);

    // Cards normales
    const albumConPortada = await Promise.all(
      albumes.map(async (album) => {
        const imagenes = await obtenerImagenesDeAlbum(album.id_album);
        const portada = imagenes.length > 0 ? imagenes[0].imagen : null;
        return { ...album, portada, esVirtual: false };
      })
    );

    // Cards de amistad (virtuales)
    const amistades = await obtenerAmigosEnviadosYAceptados(id_usuario); // [{id_usuario, nombre, apellido}, ...]
    const cardsAmistad = amistades.map(amigo => ({
      titulo: `Galería de amistad de ${amigo.nombre} ${amigo.apellido}`,
      id_amigo: amigo.id_usuario,
      portada: amigo.avatarUrl || null, // Si querés mostrar su foto de perfil
      esVirtual: true
    }));

    res.render('albumes/index', {
      albumes: [...albumConPortada, ...cardsAmistad],
      usuarioSesion: req.session.usuario
    });
  } catch (error) {
    console.error(`Error al obtener álbumes: ${error}`);
    res.status(500).send('Error al obtener álbumes');
  }
}

// Mostrar formulario 
export const mostrarFormularioCrear = (req, res) => {
  res.render('albumes/nuevo',{
    usuarioSesion: req.session.usuario
  });
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

    // Si detectás que es un álbum de amistad físico (por el título o por un campo especial)
    if (album.titulo.startsWith("Galería de amistad de")) {
      const partes = album.titulo.split(" ");
      const nombreAmigo = partes[4];
      const apellidoAmigo = partes.slice(5).join(" ");
      const amigo = await obtenerUsuarioPorNombreYApellido(nombreAmigo, apellidoAmigo);
      if (amigo) {
        return res.redirect(`/usuarios/${amigo.id_usuario}/galeria-amistad`);
      }
    }

    // Resto de la lógica para álbum real
    const imagenes = await obtenerImagenesVisibles(id_album, id_usuario_consultante);
    res.render('albumes/detalle', { 
      album,
      imagenes,
      usuarioSesion: req.session.usuario
    });
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
