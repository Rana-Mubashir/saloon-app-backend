import { Banner } from "../models/bannerModel.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    return res.status(200).json({
      success: true,
      message: "Banners fetched successfully",
      data: banners,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }
    return res.status(200).json({ success: true, data: banner });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const addBanner = async (req, res) => {
  let cloudinaryResult;

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    cloudinaryResult = await uploadToCloudinary(file);

    if (!cloudinaryResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to Cloudinary",
      });
    }

    const banner = new Banner({
      image: {
        public_id: cloudinaryResult?.data?.public_id,
        url: cloudinaryResult?.data?.url,
      },
    });
    const savedBanner = await banner.save();
    return res.status(201).json(savedBanner);
  } catch (error) {
    if (cloudinaryResult?.success) {
      await deleteFromCloudinary(cloudinaryResult.data?.public_id);
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateBanner = async (req, res) => {
  let cloudinaryResult;
  try {
    const { id } = req.params;
    const file = req.file;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }
    if (file) {
      await deleteFromCloudinary(banner.image.public_id);
      cloudinaryResult = await uploadToCloudinary(file);
      if (!cloudinaryResult.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to Cloudinary",
        });
      }
      banner.image = {
        public_id: cloudinaryResult?.data?.public_id,
        url: cloudinaryResult?.data?.url,
      };
    }

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      Banner,
    });
  } catch (error) {
    if (cloudinaryResult?.success) {
      await deleteFromCloudinary(cloudinaryResult.data?.public_id);
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) return res.status(404).json({ message: "Banner not found" });

    await deleteFromCloudinary(banner.image.public_id);
    await Banner.findByIdAndDelete(req.params.id);

    return res
      .status(200)
      .json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
