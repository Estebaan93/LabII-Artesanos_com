// controllers/comentarioController.js
import {obtenerComentariosDeImagen, agregarComentario} from "../models/comentarioModel.js";

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

    await agregarComentario({ id_imagen, id_usuario, descripcion: descripcion.trim() });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "No se pudo agregar el comentario" });
  }
};
