// routes/solicitudRoutes.js
import express from 'express';
import { crearSolicitudAmistad , responderSolicitudAmistad } from '../controllers/solicitudController.js';

const router = express.Router();

function soloLogueados(req, res, next) {
  if (!req.session.loggedin) return res.status(401).json({ error: 'Debe iniciar sesión' });
  next();
}

// Crear solicitud de amistad (POST)
router.post('/solicitudes', soloLogueados, crearSolicitudAmistad);

// Ruta para actualizar (responder) solicitud
router.post('/solicitudes/responder', soloLogueados, responderSolicitudAmistad);


export default router;
