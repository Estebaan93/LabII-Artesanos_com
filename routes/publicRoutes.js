//routes/publicRoutes.js
import express from 'express';
import {listarPortafoliosPublicos, verPortafolioPublico} from '../controllers/portafolioController.js';

const router= express.Router();

router.get('/explorar', listarPortafoliosPublicos);

//Ruta para portafolio publico de un usuario
router.get('/portafolio/:id_usuario', verPortafolioPublico);

export default router;
