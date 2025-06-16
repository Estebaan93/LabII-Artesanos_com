// routes/comentarioRoutes.js
import express from 'express';
import { listarComentarios, crearComentario } from '../controllers/comentarioController.js';

const router = express.Router();

// Ver comentarios de una imagen
router.get('/obras/:id_imagen/comentarios', listarComentarios);

// Agregar comentario a una imagen (requiere login)
function soloLogueados(req, res, next) {
  if (!req.session.loggedin) return res.status(401).json({ error: "Requiere login" });
  next();
}
router.post('/obras/:id_imagen/comentarios', soloLogueados, crearComentario);

export default router;
