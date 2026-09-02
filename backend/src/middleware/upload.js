import multer from "multer";
import { resolve } from "path";

const storage = multer.diskStorage({
  destination: resolve("uploads"),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf/;
    const ext = allowed.test(file.mimetype);
    if (ext) cb(null, true);
    else cb(new Error("Only images and PDFs are allowed"));
  },
});
