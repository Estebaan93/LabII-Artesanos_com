// controllers/solicitudController.js
import {insertarSolicitudAmistad, actualizarSolicitudAmistadPorId, obtenerUsuariosDeSolicitud, obtenerEstadoAmistad} from "../models/solicitudModel.js";
import {insertarNotificacionAmistad} from "../models/notificacionModel.js";
import {obtenerImagenesPorVisibilidad, asociarImagenAlbum} from "../models/imagenModel.js";
import {crearAlbum} from "../models/albumModel.js";
import {emitirNotificacion} from "../index.js";


export const crearSolicitudAmistad = async (req, res) => {
  try {
    const id_usuario = req.session.usuario.id_usuario;
    const { id_destinatario } = req.body;

    if (!id_destinatario || id_usuario === parseInt(id_destinatario)) {
      return res
        .status(400)
        .json({ error: "No se puede enviar solicitud a uno mismo." });
    }

    const estado = await obtenerEstadoAmistad(id_usuario, id_destinatario);
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
    const {id_solicitud, accion} = req.body;

    const accionesValidas = ["aceptar", "rechazar", "cancelar", "eliminar"];
    if (!accionesValidas.includes(accion)) {
      return res.status(400).json({ error: "Acción inválida" });
    }

    const resultado = await actualizarSolicitudAmistadPorId({id_solicitud, accion,});

    if (resultado === 0) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    const usuarios = await obtenerUsuariosDeSolicitud(id_solicitud);
    if (!usuarios) {
      return res
        .status(404)
        .json({ error: "Usuarios de solicitud no encontrados" });
    }

    const {id_usuario: id_remitente, id_destinatario} = usuarios;

    if (accion === "aceptar") {
      await insertarNotificacionAmistad({
        id_solicitud,
        id_usuario: id_remitente,
        tipo: "aceptacion",
      });

      const nombreAceptador = req.session.usuario.nombre;
      const apellidoAceptador = req.session.usuario.apellido;

      emitirNotificacion(id_remitente, {
        tipo: "aceptacion",
        remitente: nombreAceptador,
        mensaje: `${nombreAceptador} ha aceptado tu solicitud de amistad.`,
      });

      const tituloAlbum = `${nombreAceptador} ${apellidoAceptador}`;
      const id_album = await crearAlbum({
        id_usuario: id_remitente,
        titulo: tituloAlbum,
      });

      const imagenesMejoresAmigos = await obtenerImagenesPorVisibilidad(
        id_destinatario,
        "mejores_amigos"
      );

      for (const imagen of imagenesMejoresAmigos) {
        await asociarImagenAlbum(id_album, imagen.id_imagen);
      }
      console.log(
        `Se asociaron ${imagenesMejoresAmigos.length} imágenes al álbum ${id_album}`
      );
    }

    res.json({ok: true, mensaje: `Solicitud ${accion} correctamente.` });
  } catch (error) {
    console.error("Error en responder solicitud amistad:", error);
    res.status(500).json({ error: "No se pudo actualizar la solicitud." });
  }
};
