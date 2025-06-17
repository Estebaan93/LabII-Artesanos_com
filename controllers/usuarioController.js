//controllers/usuarioController.js
import bcrypt from 'bcryptjs';
import {insertarUsuario, obtenerUsuarios, eliminarUsuario, actualizarUsuario, obtenerUsuarioPorId, obtenerUsuarioPorEmail, obtenerUsuariosExcepto, obtenerUsuariosPorNombre, buscarUsuariosDisponibles} from "../models/usuarioModel.js";


export const mostrarFormulario= (req, res)=>{
  res.render('logueado/crearUsuario');
};

export const mostrarBuscador = (req, res) => {
  res.render('logueado/buscador');
  
};

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await obtenerUsuarios();
    res.render('logueado/index', { usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send('Error al obtener usuarios');
  }
};

export const procesarLogin = async (req, res) => {
  const { email, password } = req.body;
  const usuario = await obtenerUsuarioPorEmail(email);

  if (!usuario) {
    return res.status(401).json({ error: 'Usuario no encontrado' });
  }

  const passwordCorrecta = await bcrypt.compare(password, usuario.password);

  if (!passwordCorrecta) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrecta' });
  }

  req.session.loggedin = true;
  req.session.usuario = usuario;

  // Respuesta en JSON
  res.json({ mensaje: 'Login exitoso', usuario: { nombre: usuario.nombre } });
  console.log(usuario)
};



// crearUsuario.js
export const crearUsuario = async (req, res) => {
  try {
    console.log('Datos recibidos para registro:', req.body);

    const { nombre, apellido, email, password } = req.body;
    let estado = parseInt(req.body.estado);
    if (isNaN(estado) || (estado !== 0 && estado !== 1)) {
      estado = 1;
    }

    const avatarUrl = req.file?.filename || 'default.png';

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const usuarioExistente = await obtenerUsuarioPorEmail(email);
    if (usuarioExistente) {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const hash = await bcrypt.hash(password, 10);

    const idNuevoUsuario = await insertarUsuario({
      nombre,
      apellido,
      email,
      password: hash,
      avatarUrl,
      estado
    });

    // Guardar sesión
    req.session.loggedin = true;
    req.session.usuario = {
      id_usuario: idNuevoUsuario,
      nombre,
      apellido,
      email,
      avatarUrl,
      estado
    };

    // Enviar respuesta JSON
    return res.status(201).json({ mensaje: 'Usuario registrado correctamente', redirectTo: '/home' });

  } catch (error) {
    console.error('Error en crearUsuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const mostrarPerfil = async (req, res) => {
  try {
    const usuarios= await obtenerUsuarios();
    const usuario= usuarios.find(u => u.id_usuario == req.params.id);
    if (!usuario) return res.status(404).send('Usuario no encontrado');
     res.render('logueado/perfil', { usuario });
   }catch (error) {
     res.status(500).send('Error al obtener perfil de usuario');
  }
};

// Mostrar página con listado para solicitar amistad (excluye usuario actual)
export const listarUsuariosParaSolicitar = async (req, res) => {
  try {
    const id_usuario = req.session.usuario.id_usuario;
    const usuarios = await obtenerUsuariosExcepto(id_usuario);
    res.render('logueado/lista', { usuarios }); // ← ahora apunta a la carpeta correcta
  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).send('Error al obtener usuarios');
  }
};

// API para buscar usuarios por nombre (usado para autocomplete o búsqueda con JS)

export const apiBuscarUsuarios = async (req, res) => {
  try {
    const id_usuario = req.session.usuario.id_usuario;
    const nombre = req.query.nombre || '';

    const usuarios = await buscarUsuariosDisponibles(id_usuario, nombre);

    res.json(usuarios);
  } catch (error) {
    console.error("Error en apiBuscarUsuarios:", error);
    res.status(500).json({ error: "Error al buscar usuarios" });
  }
};
