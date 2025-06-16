//controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pool from '../config/db.js';

dotenv.config();

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) return res.status(401).json({ error: 'Usuario o contraseña incorrecta', passwordValida });

    const token = jwt.sign({ id: usuario.id_usuario, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
    console.log(`Token de auth ${token}`);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};
