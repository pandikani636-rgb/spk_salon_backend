import express from 'express';
import multer from 'multer';
import path from 'path';

import fs from 'fs';

const router = express.Router();

const uploadDir = process.env.VERCEL ? '/tmp/uploads' : 'uploads/';
// Ensure directory exists (especially for /tmp)
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

router.post('/', upload.single('image'), (req, res) => {
  const fileName = req.file.filename;
  res.send({
    success: true,
    data: `/uploads/${fileName}`
  });
});

export default router;
