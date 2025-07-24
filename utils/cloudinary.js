import DataURIParser from "datauri/parser.js";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import ffmpeg from "fluent-ffmpeg";

const SUPPORTED_FORMATS = {
  IMAGE: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".heic"],
  VIDEO: [".mp4", ".mov", ".avi", ".wmv", ".webm", ".mkv"],
};

const getDataUri = (file) => {
  const parser = new DataURIParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};
const validateFile = (file) => {
  if (!file?.buffer || !file?.originalname) {
    throw new Error("Invalid file object provided");
  }
  const extension = path.extname(file.originalname).toLowerCase();
  const isImage = SUPPORTED_FORMATS.IMAGE.includes(extension);
  const isVideo = SUPPORTED_FORMATS.VIDEO.includes(extension);

  if (!isImage && !isVideo) {
    throw new Error(
      `Unsupported file format. Supported formats: ${[
        ...SUPPORTED_FORMATS.IMAGE,
        ...SUPPORTED_FORMATS.VIDEO,
      ].join(", ")}`
    );
  }
};

const uploadToCloudinary = async (file, options = {}) => {
  try {
    validateFile(file);
    const dataUri = getDataUri(file);
    const extension = path.extname(file.originalname).toLowerCase();
    const resourceType = SUPPORTED_FORMATS.VIDEO.includes(extension)
      ? "video"
      : "image";

    const defaultOptions = {
      resource_type: resourceType,
      quality: "auto",
      fetch_format: "auto",
    };
    const uploadOptions = {
      ...defaultOptions,
      ...options,
    };
    const result = await cloudinary.uploader.upload(
      dataUri.content,
      uploadOptions
    );
    return {
      success: true,
      message: "Upload successful",
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        duration: result.duration,
      },
      meta: {
        resourceType,
        format: result.format,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Cloudinary upload failed: ${error.message}`,
    };
  }
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

const getVideoDuration = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    ffmpeg(fileBuffer).ffprobe(0, (err, metadata) => {
      if (err) {
        return reject("Failed to extract video duration");
      }
      resolve(metadata.format.duration);
    });
  });
};
export {
  getDataUri,
  getVideoDuration,
  uploadToCloudinary,
  deleteFromCloudinary,
};
