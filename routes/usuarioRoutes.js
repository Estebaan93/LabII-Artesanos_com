//routes/usuarioRoutes.js

import express from 'express';
import {listarUsuarios, mostrarFormulario, crearUsuario, mostrarPerfil, procesarLogin,  mostrarBuscador, apiBuscarUsuarios } from '../controllers/usuarioController.js';
import {uploadPerfil } from '../middlewares/upload.js';
import {mostrarEstadisticasPerfil} from '../controllers/estadisticaController.js';

import { verGaleriaAmigo } from '../controllers/amistadController.js';

const router = express.Router();

// Ruta principal
router.get('/', (req, res) => {
  res.render('index');
});

// Procesar login
router.post('/login', procesarLogin);

// Registro de usuarios
router.get('/logueado/nuevo', mostrarFormulario); // Muestra el formulario
router.post('/logueado', uploadPerfil.single('img_perfil'), crearUsuario); // Inserta usuario con foto de perfil

// Usuarios logueados (protegidos por sesión)
router.get('/logueado', soloLogueados, listarUsuarios);
router.get('/logueado/:id', soloLogueados, mostrarPerfil);

// Ruta /home solo para usuarios autenticados
router.get('/home', soloLogueados, (req, res) => {
  res.render('logueado/home', {
    title: 'Inicio',
    usuarioSesion: req.session.usuario
  });
});

router.get('/usuarios/:id_usuario/galeria-amistad', soloLogueados, verGaleriaAmigo);

router.get('/usuarios/buscador', soloLogueados, mostrarBuscador);
router.get('/api/usuarios/buscar', soloLogueados, apiBuscarUsuarios);


// Estadisticas (solo logueados)
router.get('/estadisticas',soloLogueados, mostrarEstadisticasPerfil);

// Logout
router.get('/logout', (req, res) => {
  console.log('Se llamó a /logout desde usuarioRoutes');

  req.session.destroy((err) => {
    if (err) {
      console.error(' Error al cerrar la sesión:', err);
      return res.status(500).send('Error al cerrar sesión');
    }

    console.log('Sesión cerrada correctamente');
    res.redirect('/');
  });
});

// Middleware para proteger rutas
function soloLogueados(req, res, next) {
  if (!req.session.loggedin) return res.redirect('/');
  next();
}

export default router;


