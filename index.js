//index.js
import express from 'express';
import { fileURLToPath } from 'url';
import usuarioRoutes from './routes/usuarioRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import imagenRoutes from './routes/imagenRoutes.js'; 
import albumRoutes from  './routes/albumRoutes.js';
import comentarioRoutes from './routes/comentarioRoutes.js';
import notificacionesRoutes from './routes/notificacionRoutes.js';
import solicitudRoutes from './routes/solicitudRoutes.js'; 
import perfilRoutes from './routes/perfilRoutes.js';
import path from 'path';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';


const app = express();
const server= http.createServer(app);
const io= new Server(server);
const onlineUsers= new Map();

io.on('connection',(socket)=>{
  console.log('Cliente conectado', socket.id);

  socket.on('register', (userId)=>{
    onlineUsers.set(userId, socket.id);
    console.log(`Usuario ${userId} conectado con socket ${socket.id}`)
  });

  socket.on('disconnect', ()=>{
    for(const [userId, sockId] of onlineUsers.entries()){
      if(sockId=== socket.id){
        onlineUsers.delete(userId);
        console.log(`Usuario ${userId} desconectado`);
        break;
      }
    }
  });
});

// Función para emitir notificación a usuario conectado
export function emitirNotificacion(userId, payload) {
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('nuevaNotificacion', payload);
  }
}


app.use(cors());
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configurar Pug como motor de vistas
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));


// Middleware base
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de sesión antes de las rutas
app.use(session({
  secret: process.env.SESSION_SECRET || "fallbackSecret",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware para usuario en `res.locals`
app.use((req, res, next) => {
  res.locals.usuario = req.session?.usuario || null;
  next();
});

// Rutas
app.use(usuarioRoutes);
app.use(publicRoutes);
app.use(imagenRoutes);
app.use(albumRoutes);
app.use(comentarioRoutes);
app.use(notificacionesRoutes);
app.use(solicitudRoutes);
app.use('/perfil', perfilRoutes);



// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


