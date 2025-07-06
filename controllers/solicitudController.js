// controllers/solicitudController.js

import {insertarSolicitudAmistad, actualizarSolicitudAmistadPorId, obtenerUsuariosDeSolicitud, obtenerEstadoAmistad, obtenerEstadoSolicitudDirecta} from "../models/solicitudModel.js";
import {insertarNotificacionAmistad } from "../models/notificacionModel.js";
import {emitirNotificacion } from "../index.js";
import {agregarAmistad} from '../models/amistadModel.js';
import pool from "../config/db.js";

/*
export const crearSolicitudAmistad = async (req, res) => {
  try {
    const id_usuario = req.session.usuario.id_usuario;
    const { id_destinatario } = req.body;

    if (!id_destinatario || id_usuario === parseInt(id_destinatario)) {
      return res
        .status(400)
        .json({ error: "No se puede enviar solicitud a uno mismo." });
    }

    const estado = await obtenerEstadoSolicitudDirecta(id_usuario, id_destinatario);
    if (estado === "aceptar" || estado === "aceptado") {
      return res.status(400).json({ error: "Ya son amigos." });
    }
    if (estado === "pendiente") {
      return res.status(400).json({ error: "Ya hay una solicitud pendiente." });
    }

    const id_solicitud = await insertarSolicitudAmistad({
      id_usuario,
      id_destinatario,
      accion: "pendiente",
    });

    await insertarNotificacionAmistad({
      id_solicitud,
      id_usuario: id_destinatario,
    });

    emitirNotificacion(id_destinatario, {
      tipo: "amistad",
      mensaje: `Nueva solicitud de amistad de ${req.session.usuario.nombre}`,
      solicitudId: id_solicitud,
    });

    res.json({ ok: true, mensaje: "Solicitud enviada correctamente." });
  } catch (error) {
    console.error("Error en crear solicitud amistad:", error);
    res.status(500).json({ error: "No se pudo enviar la solicitud." });
  }
};


export const responderSolicitudAmistad = async (req, res) => {
  try {
    const { id_solicitud, accion } = req.body;

    const accionesValidas = ["aceptar", "rechazar", "cancelar", "eliminar"];
    if (!accionesValidas.includes(accion)) {
      return res.status(400).json({ error: "Acción inválida" });
    }

    const resultado = await actualizarSolicitudAmistadPorId({ id_solicitud, accion });

    if (resultado === 0) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    const usuarios = await obtenerUsuariosDeSolicitud(id_solicitud);
    if (!usuarios) {
      return res
        .status(404)
        .json({ error: "Usuarios de solicitud no encontrados" });
    }

    const { id_usuario: id_emisor, id_destinatario } = usuarios;
    const id_aceptador=req.session.usuario.id_usuario;

    if (accion === "aceptar" && id_aceptador !==id_emisor) {
      await insertarNotificacionAmistad({
        id_solicitud,
        id_usuario: id_emisor,
        tipo: "aceptacion",
      });

      const nombreAceptador = req.session.usuario.nombre;

      emitirNotificacion(id_emisor, {
        tipo: "aceptacion",
        remitente: nombreAceptador,
        mensaje: `${nombreAceptador} ha aceptado tu solicitud de amistad.`,
      });

      // *** Ya NO se crea álbum físico de amistad ***
      // La galería de amistad es virtual (ver lógica en listarAlbumes)
    }

    res.json({ ok: true, mensaje: `Solicitud ${accion} correctamente.` });
  } catch (error) {
    console.error("Error en responder solicitud amistad:", error);
    res.status(500).json({ error: "No se pudo actualizar la solicitud." });
  }
}; 

*/


export const crearSolicitudAmistad = async (req, res) => {
  try {
    const id_usuario = req.session.usuario.id_usuario;
    const { id_destinatario } = req.body;

    // No se puede enviar a uno mismo
    if (!id_destinatario || parseInt(id_destinatario) === id_usuario) {
      return res.status(400).json({ error: 'No se puede enviar solicitud a uno mismo.' });
    }

    // Verifica si ya existe una solicitud directa
    const estadoDirecto = await obtenerEstadoSolicitudDirecta(id_usuario, id_destinatario);
    if (estadoDirecto === 'pendiente') {
      return res.status(400).json({ error: 'Ya enviaste una solicitud pendiente a este usuario.' });
    }
    if (estadoDirecto === 'aceptar') {
      return res.status(400).json({ error: 'Este usuario ya compartió contigo.' });
    }

    // Si B ya envió a A, puede existir esa solicitud. Pero no la invalidamos.

    const id_solicitud = await insertarSolicitudAmistad({
      id_usuario,
      id_destinatario,
      accion: 'pendiente'
    });

    await insertarNotificacionAmistad({
      id_solicitud,
      id_usuario: id_destinatario
    });

    emitirNotificacion(id_destinatario, {
      tipo: 'amistad',
      mensaje: `Nueva solicitud de amistad de ${req.session.usuario.nombre}`,
      solicitudId: id_solicitud
    });

    res.json({ ok: true, mensaje: 'Solicitud enviada correctamente.' });
  } catch (error) {
    console.error('Error en crear solicitud amistad:', error);
    res.status(500).json({ error: 'No se pudo enviar la solicitud.' });
  }
};


export const responderSolicitudAmistad = async (req, res) => {
  try {
    const { id_solicitud, accion } = req.body;
    const id_aceptador = req.session.usuario.id_usuario;

    const accionesValidas = ['aceptar', 'rechazar'];
    if (!accionesValidas.includes(accion)) {
      return res.status(400).json({ error: 'Acción inválida' });
    }

    // Actualizar estado de solicitud
    const actualizada = await actualizarSolicitudAmistadPorId({ id_solicitud, accion });
    if (!actualizada) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const usuarios = await obtenerUsuariosDeSolicitud(id_solicitud);
    if (!usuarios) {
      return res.status(404).json({ error: 'Usuarios no encontrados' });
    }

    const { id_usuario: id_remitente, id_destinatario } = usuarios;

    // Eliminar la notificación de solicitud del usuario que respondió
    await pool.query(`
      DELETE FROM notificacion_amistad
      WHERE id_solicitud = ? AND id_usuario = ?
    `, [id_solicitud, id_aceptador]);

    if (accion === 'aceptar') {
      // Si el que acepta NO es el que envió, notificar al emisor
      if (id_aceptador !== id_remitente) {
        await insertarNotificacionAmistad({
          id_solicitud,
          id_usuario: id_remitente,
          tipo: 'aceptacion'
        });

        emitirNotificacion(id_remitente, {
          tipo: 'aceptacion',
          remitente: req.session.usuario.nombre,
          mensaje: `${req.session.usuario.nombre} aceptó tu solicitud de amistad.`
        });
      }
    }

    res.json({ ok: true, mensaje: `Solicitud ${accion} correctamente.` });

  } catch (error) {
    console.error('Error en responderSolicitudAmistad:', error);
    res.status(500).json({ error: 'Error interno al procesar la solicitud.' });
  }
};



/*export const responderSolicitudAmistad = async (req, res) => {
  try {
    const { id_solicitud, accion } = req.body;
    const id_usuario_sesion = req.session.usuario.id_usuario;

    // Actualiza el estado de la solicitud
    await actualizarSolicitudAmistadPorId({ id_solicitud, accion });

    if (accion === "aceptar") {
      // Obtener los usuarios involucrados
      const { id_usuario: emisor, id_destinatario: receptor } = await obtenerUsuariosDeSolicitud(id_solicitud);

      // Quien acepta es el usuario en sesión
      const id_aceptador = id_usuario_sesion;

      // El otro es el que debe recibir la notificación (quien envió originalmente)
      const id_para_notificar = id_aceptador === emisor ? receptor : emisor;

      // Agregar amistad en base de datos
      await agregarAmistad(id_usuario_sesion, id_para_notificar);

      // Insertar notificación en base de datos
      await insertarNotificacionAmistad({
        id_solicitud,
        id_usuario: id_para_notificar
      });

      // Emitir notificación en tiempo real
      await emitirNotificacion(id_para_notificar, {
        tipo: "aceptacion",
        remitente: req.session.usuario.nombre,
        mensaje: `${req.session.usuario.nombre} aceptó tu solicitud de amistad.`
      });
    }

    res.status(200).json({ mensaje: 'Solicitud procesada con éxito' });

  } catch (error) {
    console.error('Error al responder solicitud de amistad:', error);
    res.status(500).json({ error: 'Error interno al responder solicitud' });
  }
};*/

/*export const responderSolicitudAmistad = async (req, res) => {
  try {
    const { id_solicitud, accion } = req.body;
    const id_sesion = req.session.usuario.id_usuario;

    const accionesValidas = ["aceptar", "rechazar", "cancelar", "eliminar"];
    if (!accionesValidas.includes(accion)) {
      return res.status(400).json({ error: "Acción inválida" });
    }

    const resultado = await actualizarSolicitudAmistadPorId({ id_solicitud, accion });
    if (resultado === 0) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    // Obtener usuarios relacionados a la solicitud
    const { id_usuario: id_emisor, id_destinatario } = await obtenerUsuariosDeSolicitud(id_solicitud);

    // Determinar quién debe recibir la notificación
    // id_emisor: el que envió la solicitud originalmente
    // id_sesion: el que la está aceptando o rechazando ahora
    // Queremos que la notificación llegue al que NO está logueado
    const id_receptor = id_sesion === id_emisor ? id_destinatario : id_emisor;

    if (accion === "aceptar") {
      // Crear notificación para el emisor original
      await insertarNotificacionAmistad({
        id_solicitud,
        id_usuario: id_receptor //  este la recibe
      });

      // Emitir evento en tiempo real al emisor original
      emitirNotificacion(id_receptor, {
        tipo: "aceptacion",
        remitente: req.session.usuario.nombre,
        mensaje: `${req.session.usuario.nombre} ha aceptado tu solicitud de amistad.`
      });
    }

    res.json({ ok: true, mensaje: `Solicitud ${accion} correctamente.` });
  } catch (error) {
    console.error("Error en responder solicitud amistad:", error);
    res.status(500).json({ error: "No se pudo actualizar la solicitud." });
  }
};

*/

/*export const responderSolicitudAmistad = async (req, res) => {
  try {
    const { id_solicitud, accion } = req.body;

    const accionesValidas = ["aceptar", "rechazar", "cancelar", "eliminar"];
    if (!accionesValidas.includes(accion)) {
      return res.status(400).json({ error: "Acción inválida" });
    }

    const resultado = await actualizarSolicitudAmistadPorId({ id_solicitud, accion });

    if (resultado === 0) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    const usuarios = await obtenerUsuariosDeSolicitud(id_solicitud);
    if (!usuarios) {
      return res
        .status(404)
        .json({ error: "Usuarios de solicitud no encontrados" });
    }

    const { id_usuario: id_remitente } = usuarios;

    if (accion === "aceptar") {
      await insertarNotificacionAmistad({
        id_solicitud,
        id_usuario: id_remitente,
        tipo: "aceptacion",
      });

      const nombreAceptador = req.session.usuario.nombre;

      emitirNotificacion(id_remitente, {
        tipo: "aceptacion",
        remitente: nombreAceptador,
        mensaje: `${nombreAceptador} ha aceptado tu solicitud de amistad.`,
      });

      // *** Ya NO se crea álbum físico de amistad ***
      // La galería de amistad es virtual (ver lógica en listarAlbumes)
    }

    res.json({ ok: true, mensaje: `Solicitud ${accion} correctamente.` });
  } catch (error) {
    console.error("Error en responder solicitud amistad:", error);
    res.status(500).json({ error: "No se pudo actualizar la solicitud." });
  }
};*/
