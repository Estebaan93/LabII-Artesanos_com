// controllers/notificacionController.js
import {obtenerNotificacionesNoLeidas, marcarNotificacionLeida} from '../models/notificacionModel.js';

export const listarNotificaciones = async (req, res) => {
  try {
    const id_usuario = req.session.usuario.id_usuario;
    const notificaciones = await obtenerNotificacionesNoLeidas(id_usuario);
    console.log('Notificaciones obtenidas:', notificaciones);
    res.render('notificaciones/listar', { notificaciones });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener notificaciones');
  }
};

export const marcarLeida = async (req, res) => {
  /*try {
    const id_notificacion = req.params.id_notificacion;
    const exito = await marcarNotificacionLeida(id_notificacion);
    if (exito) res.json({ ok: true });
    else res.status(404).json({ error: 'Notificación no encontrada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al marcar notificación' });
  }*/
  try {
    const id_notificacion = req.params.id_notificacion;
    const exito = await marcarNotificacionLeida(id_notificacion);

    if (exito) {
      res.json({ ok: true, mensaje: 'Notificación marcada como leída' });
    } else {
      res.status(404).json({ error: 'Notificación no encontrada' });
    }
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }

  
};


export const listarNotificacionesAPI = async (req, res) => {
  try {
    const id_usuario = req.session.usuario.id_usuario;
    const notificaciones = await obtenerNotificacionesNoLeidas(id_usuario);
    res.json(notificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};
