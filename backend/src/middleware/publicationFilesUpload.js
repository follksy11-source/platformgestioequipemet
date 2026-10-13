
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const dossiers = {
  image: path.join(process.cwd(), "uploads/images/publications"),
  pdf: path.join(process.cwd(), "uploads/pdfs/publications"),
};

Object.values(dossiers).forEach((dossier) => {
  fs.mkdirSync(dossier, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dossiers[file.fieldname]);
  },
  filename: (req, file, cb) => {
    const extension =
      file.fieldname === "pdf"
        ? ".pdf"
        : path.extname(file.originalname).toLowerCase();

    cb(
      null,
      `${Date.now()}-${require("crypto").randomUUID()}${extension}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    const extensions = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (
      extensions.includes(ext) &&
      ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
    ) {
      return cb(null, true);
    }

    return cb(new Error("Format d'image non autorisé."));
  }

  if (file.fieldname === "pdf") {
    if (
      path.extname(file.originalname).toLowerCase() === ".pdf" &&
      file.mimetype === "application/pdf"
    ) {
      return cb(null, true);
    }

    return cb(new Error("Le fichier doit être un PDF."));
  }

  return cb(new Error("Champ de fichier non autorisé."));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 2,
  },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);