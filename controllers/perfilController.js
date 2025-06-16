import {
  obtenerDatosUsuario,
  obtenerFormacionesUsuario,
  obtenerInteresesUsuario,
  actualizarDatosUsuario
} from '../models/perfilModel.js';

export const verPerfil = async (req, res) => {
  try {
    const id_usuario = req.session.usuario?.id_usuario;
    if (!id_usuario) return res.redirect('/login');

    const usuario = await obtenerDatosUsuario(id_usuario);
    const formaciones = await obtenerFormacionesUsuario(id_usuario);
    const intereses = await obtenerInteresesUsuario(id_usuario);

    res.render('perfil/perfil', {
      usuario,
      formaciones,
      intereses
    });
  } catch (error) {
    console.error('Error al cargar el perfil:', error);
    res.status(500).send('Error al cargar el perfil');
  }
};

export const mostrarEditarPerfil = async (req, res) => {
  try {
    const id_usuario = req.session.usuario?.id_usuario;
    if (!id_usuario) return res.redirect('/login');

    const usuario = await obtenerDatosUsuario(id_usuario);
    const formacionesUsuario = await obtenerFormacionesUsuario(id_usuario);

    // Opciones fijas para el select de formación
    const opcionesFormacion = [
      'Carpintería',
      'Alfarería',
      'Tejido',
      'Joyería artesanal',
      'Cesteria',
      'Talabarteria',
      'Bordado',
      'Vidrio',
    ];

    res.render('perfil/editarPerfil', {
      usuario,
      opcionesFormacion,
      formacionesUsuario // enviamos todas las formaciones para que se editen
    });
  } catch (error) {
    console.error('Error al mostrar formulario de edición:', error);
    res.status(500).send('Error al cargar el formulario de edición');
  }
};

export const actualizarPerfil = async (req, res) => {
  try {
    const id_usuario = req.session.usuario?.id_usuario;
    if (!id_usuario) return res.redirect('/login');

    const { nombre, apellido, email, avatarUrl } = req.body;

    // Recibimos formaciones como JSON (por ejemplo con un input hidden o por JS)
    // Si vienen desde inputs con nombre formaciones[0][tipo] etc, express lo parsea directo como objeto/array
    let formaciones = req.body.formaciones;

    // Si es string JSON, parsear, si no, asumir objeto/array
    if (typeof formaciones === 'string') {
      try {
        formaciones = JSON.parse(formaciones);
      } catch {
        formaciones = [];
      }
    }

    // Asegurar que formaciones es array
    if (!Array.isArray(formaciones)) {
      formaciones = [];
    }

    await actualizarDatosUsuario(id_usuario, { nombre, apellido, email, avatarUrl, formaciones });

    res.redirect('/perfil');
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).send('Error al actualizar perfil');
  }
};
