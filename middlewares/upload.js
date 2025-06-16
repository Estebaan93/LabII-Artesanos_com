//midlewares/upload.js
/*import multer from 'multer';
import path from 'path';

const storage= multer.diskStorage({
	destination: (req, file, cb)=>{
		cb(null, 'public/img/perfiles'); // imagenes de perfiles
	},
	filename: (req, file, cb)=>{
		const ext= path.extname(file.originalname);
		const uniqueName= `usuario_${Date.now()}${ext}`;
		cb(null, uniqueName);
	}
});

export const upload= multer({
	storage,
	limits: {fileSize: 2 *1024 * 1024}, // Max 2MB
	fileFilter: (req, file, cb)=>{
		const allowed= /jpeg|jpg|png|gif/;
		const ext= path.extname(file.originalname).toLowerCase();
		const mime= file.mimetype;
		if(allowed.test(ext) && allowed.test(mime)){
			cb(null, true);
		}else{
			cb(new Error(`Solo se permiten imagenes`));
		}
	}
});*/

import multer from 'multer';
import path from 'path';

// 1. Storage para imágenes de perfil
const storageImgPerfil = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/perfiles');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `usuario_${Date.now()}${ext}`);
  }
});

// 2. Storage para obras
const storageObra = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/obras');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `obra_${Date.now()}${ext}`);
  }
});

// 3. Middleware para perfil
export const uploadPerfil = multer({
  storage: storageImgPerfil,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowed.test(ext) && allowed.test(mime)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'));
  }
});

// 4. Middleware para obras
export const uploadObra = multer({
  storage: storageObra,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowed.test(ext) && allowed.test(mime)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'));
  }
});
