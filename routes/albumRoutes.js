//routes/albumRoutes.js

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

