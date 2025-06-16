//middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const autenticarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extrae el token del encabezado
    console.log(token);
    if (!token) return res.status(403).json({ error: 'Acceso denegado, token requerido' });

    try {
        const usuario = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = usuario;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

export default autenticarToken;