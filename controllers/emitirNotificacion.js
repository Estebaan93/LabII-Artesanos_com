// controllers/emitirNotificacion.js
import { insertarSolicitudAmistad } from '../models/solicitudModel.js';
import { insertarNotificacionAmistad } from '../models/notificacionModel.js';
import { emitirNotificacion } from '../index.js';

// Crear solicitud de amistad, guardar notificación y emitir evento socket
export const crearSolicitud = async (req, res) => {
  try {
    const id_usuario = req.session.usuario.id_usuario; // quien envía solicitud
    const { id_destinatario } = req.body;

    // Insertar solicitud en base de datos
    const solicitudId = await insertarSolicitudAmistad({
      id_usuario,
      id_destinatario,
      accion: 'pendiente'
    });

    // Insertar notificación para destinatario
    await insertarNotificacionAmistad({
      id_solicitud: solicitudId,
      id_usuario: id_destinatario
    });

    // Emitir notificación real-time al destinatario
    emitirNotificacion(id_destinatario, {
      tipo: 'amistad',
      mensaje: `Nueva solicitud de amistad de ${req.session.usuario.nombre}`,
      solicitudId
    });

    res.json({ ok: true, mensaje: 'Solicitud enviada' });

  } catch (error) {
    console.error('Error creando solicitud:', error);
    res.status(500).json({ error: 'Error al enviar solicitud' });
  }
};
