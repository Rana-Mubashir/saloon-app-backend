import multer from "multer";
const MB = 1024 * 1024;

const FILE_CONFIG = {
  file: {
    types: ["image/jpeg", "image/png", "image/jpg"],
    maxSize: 5 * MB,
    maxCount: 1,
  },
  intro: {
    types: ["video/mp4", "video/mkv", "video/webm"],
    maxSize: 300 * MB,
    maxCount: 1,
  },
  thumbnail: {
    types: ["image/jpeg", "image/png", "image/jpg"],
    maxSize: 5 * MB,
    maxCount: 1,
  },
  video: {
    types: ["video/mp4", "video/mkv", "video/webm"],
    maxSize: 300 * MB,
    maxCount: 1,
  },
};

const fileFilter = (req, file, cb) => {
  const config = FILE_CONFIG[file.fieldname];
  if (!config) {
    return cb(new Error("Please upload a valid field."), false);
  }
  if (!config.types.includes(file.mimetype)) {
    return cb(new Error(`Please provide a valid file format.`), false);
  }
  const fileSize = parseInt(req.headers["content-length"]);
  if (fileSize > config.maxSize) {
    return cb(new Error(`File size is too large`), false);
  }
  cb(null, true);
};

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 300 * MB },
});

export const singleUpload = upload.single("file");

export const dynamicFieldsUpload = upload.fields(
  Object.entries(FILE_CONFIG)
    .filter(([key]) => ["thumbnail", "intro", "video"].includes(key))
    .map(([name, config]) => ({
      name,
      maxCount: config.maxCount,
    }))
);

export default {
  singleUpload,
  dynamicFieldsUpload,
};
