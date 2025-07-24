import { Interest } from "../models/interestModel.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
export const addInterest = async (req, res) => {
  let cloudinaryResult;
  try {
    const { name } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }
    const existingInterest = await Interest.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingInterest) {
      return res.status(409).json({
        success: false,
        message: "Interest with this name already exists",
      });
    }

    cloudinaryResult = await uploadToCloudinary(file);

    if (!cloudinaryResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to Cloudinary",
      });
    }

    const interest = new Interest({
      name: name?.trim()?.toLowerCase(),
      image: {
        public_id: cloudinaryResult.data.public_id,
        url: cloudinaryResult.data?.url,
      },
    });

    await interest.save();

    return res.status(201).json({
      success: true,
      message: "Interest added successfully",
      interest,
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
export const getInterestByAdmin = async (req, res) => {
  try {
    const data = await Interest.find();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getInterest = async (req, res) => {
  try {
    const page = Math.abs(parseInt(req.query.page, 10)) || 1;
    const perPage = Math.abs(parseInt(req.query.per_page, 10)) || 10;

    const skip = (page - 1) * perPage;
    const [data, totalItems] = await Promise.all([
      Interest.find().skip(skip).limit(perPage),
      Interest.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalItems / perPage);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        current_page: page,
        per_page: perPage,
        total_items: totalItems,
        total_pages: totalPages,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getInterestById = async (req, res) => {
  try {
    const { id } = req.params;

    const interest = await Interest.findById(id);

    if (!interest) {
      return res.status(404).json({
        success: false,
        message: "Interest not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: interest,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const deleteInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const interest = await Interest.findById(id);

    if (!interest) {
      return res
        .status(404)
        .json({ success: false, message: "Interest not found" });
    }

    await deleteFromCloudinary(interest.image.public_id);
    await Interest.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ success: true, message: "Interest deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateInterest = async (req, res) => {
  let cloudinaryResult;
  try {
    const { id } = req.params;
    const { name } = req.body;
    const file = req.file;

    const interest = await Interest.findById(id);
    if (!interest) {
      return res
        .status(404)
        .json({ success: false, message: "Interest not found" });
    }

    if (file) {
      await deleteFromCloudinary(interest.image.public_id);
      cloudinaryResult = await uploadToCloudinary(file);
      if (!cloudinaryResult.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to Cloudinary",
        });
      }
      interest.image = {
        public_id: cloudinaryResult.data?.public_id,
        url: cloudinaryResult.data?.url,
      };
    }

    if (name) interest.name = name;

    await interest.save();

    return res.status(200).json({
      success: true,
      message: "Interest updated successfully",
      interest,
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
