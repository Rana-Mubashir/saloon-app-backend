import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { Admin } from "../models/adminModel.js";
import Blacklist from "../models/blacklistModel.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed.",
      });
    }
    const blacklistedToken = await Blacklist.findOne({ token });

    if (blacklistedToken) {
      return res.status(401).send({
        success: false,
        message: "Token has been invalidated",
      });
    }
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    const user = await User.findOne({
      _id: decoded.id,
      isDeleted: false,
    })
      .select("-password")
      .populate("interests", "name image");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
      error: error.message,
    });
  }
};

export const authAdmin = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
  const blacklistedToken = await Blacklist.findOne({ token });

  if (blacklistedToken) {
    return res.status(401).send({
      success: false,
      message: "Token has been invalidated",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWTSECRETADMIN);
    const id = decoded?.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }
    req.admin = await Admin.findById(id).select("id name email");
    req.token = token;
    if (!req.admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid token",
    });
  }
};
