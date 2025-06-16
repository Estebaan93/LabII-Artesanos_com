// routes/notificacionRoutes.js 
import express from 'express';
import {
  listarNotificaciones,
  marcarLeida,
  listarNotificacionesAPI
} from '../controllers/notificacionController.js';

import {
  responderSolicitudAmistad
} from '../controllers/solicitudController.js'; // 👈 nuevo controlador que ahora agregamos

const router = express.Router();

// Middleware: solo si está logueado
function soloLogueados(req, res, next) {
  if (!req.session.loggedin) return res.redirect('/');
  next();
}

// Rutas de notificaciones
router.get('/notificaciones', soloLogueados, listarNotificaciones);
router.post('/notificaciones/:id_notificacion/leida', soloLogueados, marcarLeida);
router.get('/notificaciones/api', soloLogueados, listarNotificacionesAPI);

// ✅ NUEVA RUTA: aceptar/rechazar solicitud de amistad
router.post('/solicitudes/responder', soloLogueados, responderSolicitudAmistad);


export default router;
