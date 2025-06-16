// controllers/portafolioController.js
import { obtenerUsuariosConImagenPublica, obtenerAlbumesPublicosPorUsuario, obtenerImagenesPublicasPorAlbum } from '../models/portafolioModel.js';
import {obtenerUsuarioPorId} from '../models/usuarioModel.js';
import {obtenerImagenesVisibles} from '../models/imagenModel.js';

export const verPortafolioPublico = async (req, res) => {
  try {
    const id_usuario = req.params.id_usuario;
    const usuario = await obtenerUsuarioPorId(id_usuario);
    const albumes = await obtenerAlbumesPublicosPorUsuario(id_usuario);

    const albumesConImagenes = await Promise.all(albumes.map(async (album) => {
      const imagenes = await obtenerImagenesPublicasPorAlbum(album.id_album);
      return { ...album, imagenes };
    }));

    res.render('public/portafolio', { 
      albumes: albumesConImagenes, 
      usuario,
      title: 'Portafolio público' 
    });
  } catch (error) {
    console.error('Error al ver portafolio público:', error);
    res.status(500).send('Error al obtener portafolio público');
  }
};

export const listarPortafoliosPublicos = async (req, res) => {
  try {
    const usuarios = await obtenerUsuariosConImagenPublica();
    res.render('public/explorePublic', { usuarios, title: 'Portafolios públicos' });
  } catch (error) {
    console.error('Error al listar portafolios públicos:', error);
    res.status(500).send('Error al obtener portafolios públicos');
  }
};
