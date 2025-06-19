//routes/albumRoutes.js
/*import express from 'express';
import { listarAlbumes, mostrarFormularioCrear, crearAlbumPost, verAlbum} from '../controllers/albumController.js';

const router= express.Router();

//Funcion rutas (solo logueados)
function soloLogueados(req, res, next){
	if(!req.session.loggedin) return res.redirect('/');
	next();
}

router.get('/albumes', soloLogueados,listarAlbumes);
router.get('/albumes/nuevo', soloLogueados, mostrarFormularioCrear);
router.post('/albumes', soloLogueados, crearAlbumPost);
router.get('/album/:id_album', soloLogueados, verAlbum);

export default router;*/

import express from 'express';
import {listarAlbumes, mostrarFormularioCrear, crearAlbumPost, verAlbum, eliminarAlbum} from '../controllers/albumController.js';

const router = express.Router();

router.get('/albumes', soloLogueados, listarAlbumes);
router.get('/albumes/nuevo', soloLogueados, mostrarFormularioCrear);
router.post('/albumes', soloLogueados, crearAlbumPost);
router.get('/albumes/:id_album', soloLogueados, verAlbum);
router.delete('/albumes/:id_album',soloLogueados, eliminarAlbum)

function soloLogueados(req, res, next) {
  if (!req.session.loggedin) return res.redirect('/');
  next();
}

export default router;

