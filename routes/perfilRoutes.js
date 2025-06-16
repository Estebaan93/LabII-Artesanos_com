import express from 'express';
import { verPerfil, mostrarEditarPerfil, actualizarPerfil } from '../controllers/perfilController.js';

const router = express.Router();

// Ruta para ver el perfil
router.get('/', verPerfil);
router.get('/editar', mostrarEditarPerfil);
router.post('/editar', actualizarPerfil);

export default router;
