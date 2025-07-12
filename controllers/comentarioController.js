// controllers/comentarioController.js
import {obtenerComentariosDeImagen, agregarComentario} from "../models/comentarioModel.js";
import {obtenerImagenPorId} from '../models/imagenModel.js';
import {insertarNotificacionContenido} from '../models/notificacionModel.js';
import {emitirNotificacion}from '../index.js';

// Listar comentarios (JSON)
export const listarComentarios = async (req, res) => {
  try {
    const id_imagen = req.params.id_imagen;
    const comentarios = await obtenerComentariosDeImagen(id_imagen);
    res.json(comentarios);
  } catch (err) {
    res.status(500).json({ error: "No se pudieron cargar los comentarios" });
  }
};

// Agregar comentario (POST)
export const crearComentario = async (req, res) => {
  try {
    const id_imagen = req.params.id_imagen;
    const id_usuario = req.session.usuario.id_usuario;
    const {descripcion} = req.body;

    if (!descripcion || !descripcion.trim()) {
      return res.status(400).json({ error: "El comentario no puede estar vacío" });
    }

    //Agregar comentario
    const id_comentario= await agregarComentario({ id_imagen, id_usuario, descripcion: descripcion.trim() });

    //Obtener la img y su autor
    const imagen= await obtenerImagenPorId(id_imagen);
    let autorId= null;
    let id_album= null;
    if(imagen){
      id_album= imagen.id_album; //Obtenemos el id usuario a traves del album
      if(id_album){
        const {obtenerAlbumPorId}= await import('../models/albumModel.js');
        const album= await obtenerAlbumPorId(id_album);
        if(album) autorId= album.id_usuario;
      }
    }
    
    //Armar el link
    //const link= id_album ? `/albumes/${id_album}#img-${id_imagen}` : `/albumes#img-${id_imagen}`;

    //Insertar y emitir notificaciones (si no es auto comentario) 
    if(autorId && autorId!== id_usuario){
      //Guardamos en la BD la notificaio
      await insertarNotificacionContenido({id_comentario, id_usuario: autorId});

      console.log({ id_album, id_imagen, autorId, descripcion });

      //Emitimos noti en tiempo real
      emitirNotificacion(autorId,{
        tipo: "comentario",
        remitente: req.session.usuario.nombre,
        id_imagen,
        comentario: descripcion.slice(0,40), //Primeros 40 caracteres
        link: `/albumes/${id_album}#img-${id_imagen}`
      });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "No se pudo agregar el comentario" });
  }
};
