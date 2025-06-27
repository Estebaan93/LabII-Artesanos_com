//routes/imagenRoutes.js

import express from 'express';
import {uploadObra} from '../middlewares/upload.js';
import {mostrarFormularioSubir, procesarSubidaImagen, eliminarImagen, eliminarMultiplesImg} from '../controllers/imagenController.js';

const router = express.Router();

function soloLogueados(req, res, next) {
  if (!req.session.loggedin) return res.redirect('/');
  next();
}

// Formulario para subir imagen a un álbum específico
router.get('/albumes/:id_album/obras/nueva', soloLogueados, mostrarFormularioSubir);

// Procesar subida (archivo o URL)
router.post('/albumes/:id_album/obras', soloLogueados, uploadObra.array('imagen_local',20), procesarSubidaImagen);


//Eliminar imagen
router.post('/albumes/:id_album/obras/:id_imagen/eliminar', soloLogueados, eliminarImagen);

// Nueva ruta para eliminar múltiples imágenes NO SE ESTA USANDO
router.post('/albumes/:id_album/obras/eliminar-multiples', soloLogueados, eliminarMultiplesImg);


export default router;


