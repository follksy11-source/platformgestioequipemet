const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "../../uploads");

const dossiers = {
  equipementsImages: path.join(uploadsDir, "images", "equipements"),
  laboratoiresImages: path.join(uploadsDir, "images", "laboratoires"),
  institutionsImages: path.join(uploadsDir, "images", "institutions"),
  equipementsModels: path.join(uploadsDir, "models", "equipements"),
  factsModels: path.join(uploadsDir, "models", "facts"),
};

// Création automatique des dossiers
Object.values(dossiers).forEach((dossier) => {
  if (!fs.existsSync(dossier)) {
    fs.mkdirSync(dossier, { recursive: true });
  }
});

// ------------------------------------------------------
// Fonction de stockage
// ------------------------------------------------------

const createStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },

    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();

      const nom = path
        .basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .toLowerCase();

      cb(null, `${Date.now()}-${nom}${extension}`);
    },
  });

// ------------------------------------------------------
// Validation images
// ------------------------------------------------------

const imageFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const extensionsAutorisees = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
  ];

  if (!extensionsAutorisees.includes(extension)) {
    return cb(
      new Error(
        "Format d'image non autorisé. Utilisez JPG, JPEG, PNG ou WEBP."
      )
    );
  }

  cb(null, true);
};

// ------------------------------------------------------
// Validation modèles 3D
// ------------------------------------------------------

const modele3DFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const extensionsAutorisees = [".glb", ".gltf"];

  if (!extensionsAutorisees.includes(extension)) {
    return cb(
      new Error(
        "Format de modèle 3D non autorisé. Utilisez GLB ou GLTF."
      )
    );
  }

  cb(null, true);
};

// ------------------------------------------------------
// Upload images équipements
// ------------------------------------------------------

const uploadImageEquipement = multer({
  storage: createStorage(dossiers.equipementsImages),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// ------------------------------------------------------
// Upload images laboratoires
// ------------------------------------------------------

const uploadImageLaboratoire = multer({
  storage: createStorage(dossiers.laboratoiresImages),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// ------------------------------------------------------
// Upload images institutions
// ------------------------------------------------------

const uploadImageInstitution = multer({
  storage: createStorage(dossiers.institutionsImages),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// ------------------------------------------------------
// Upload modèles 3D
// ------------------------------------------------------

const uploadModele3D = multer({
  storage: createStorage(dossiers.equipementsModels),
  fileFilter: modele3DFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

const uploadModele3DFact = multer({
  storage: createStorage(dossiers.factsModels),
  fileFilter: modele3DFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = {
  uploadImageEquipement,
  uploadImageLaboratoire,
  uploadImageInstitution,
  uploadModele3D,
  uploadModele3DFact,
};