import { Admin } from "../models/adminModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/helpers.js";
import Blacklist from "../models/blacklistModel.js";

export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send({
      success: false,
      message: "Name, email, and password are required.",
    });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).send({
        success: false,
        message: "Admin with this email already exists.",
      });
    }

    const newAdmin = new Admin({
      name,
      email,
      password,
    });

    await newAdmin.save();

    const token = generateToken(newAdmin._id, "admin");
    return res.status(201).send({
      success: true,
      message: "Admin created successfully.",
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
      token,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message || "Failed to create admin.",
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }

    if (!(await bcrypt.compare(password, admin.password))) {
      return res.status(404).send({
        success: false,
        message: "Password mismatch",
      });
    }

    const token = generateToken(admin._id, "admin");

    return res.status(200).send({
      success: true,
      message: "Login successful",
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
export const adminDetails = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    return res.status(200).send({
      success: true,
      admin,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
export const adminLogout = async (req, res) => {
  try {
    const token = req.token;

    if (!token) {
      return reply.status(400).send({
        success: false,
        message: "No token provided",
      });
    }
    await Blacklist.create({ token });
    req.user = null;
    req.token = null;
    return res.status(200).send({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
