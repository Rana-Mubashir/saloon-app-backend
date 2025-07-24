import { User, SkillLevel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
import { generateOtp, generateToken } from "../utils/helpers.js";
import Blacklist from "../models/blacklistModel.js";
import { otpEmailTemplate } from "../emails/templates/otpEmail.js";
import { sendEmail } from "../helpers/helpers.js";
import { Interest } from "../models/interestModel.js";

export const register = async (request, res) => {
  try {
    const { name, email, password, phone } = request.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).send({
        success: false,
        message: "Name, password, and either email or phone are required",
      });
    }

    const query = {
      isDeleted: false,
      isOtpVerified: true,
      $or: [
        ...(email ? [{ email: email.toLowerCase() }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    };

    const verifiedUser = await User.findOne(query);

    if (!verifiedUser) {
      return res.status(400).send({
        success: false,
        message: "Please verify your OTP before registration.",
      });
    }

    if (verifiedUser.isRegistered || verifiedUser.password) {
      return res.status(400).send({
        success: false,
        message: "This account is already registered. Please login.",
      });
    }

    try {
      verifiedUser.name = name;
      verifiedUser.password = password;
      verifiedUser.isRegistered = true;

      await verifiedUser.save();

      const token = generateToken(verifiedUser.id, "user");

      const { password: _, ...userWithoutPassword } = verifiedUser.toObject();
      return res.status(201).send({
        success: true,
        message: "Registration successful",
        jwtToken: token,
        user: userWithoutPassword,
      });
    } catch (saveError) {
      console.error("Error saving user details:", saveError);

      if (saveError.name === "ValidationError") {
        return res.status(400).send({
          success: false,
          message: "Invalid user data provided",
          errors: Object.values(saveError.errors).map((err) => err.message),
        });
      }

      if (saveError.code === 11000) {
        return res.status(400).send({
          success: false,
          message: "This email or phone number is already registered",
          field: Object.keys(saveError.keyPattern)[0],
        });
      }

      return res.status(400).send({
        success: false,
        message: "Unable to complete registration. Please try again.",
        error: {
          type: saveError.name,
          message: saveError.message,
        },
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).send({
      success: false,
      message: "Internal server error. Please try again later.",
      error: error.message,
    });
  }
};

export const generateUserOtp = async (request, res) => {
  try {
    const { phone, email } = request.body;

    if (!phone && !email) {
      return res.status(400).send({
        success: false,
        message: "Phone or email must be provided",
      });
    }

    const query = {
      isDeleted: false,
      ...(phone && phone.trim() ? { phone: phone.trim() } : {}),
      ...(email && email.trim() ? { email: email.toLowerCase().trim() } : {}),
    };

    const user = await User.findOne(query);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user) {
      if (user.otpRestrictionExpiry && new Date() < user.otpRestrictionExpiry) {
        const timeLeft =
          user.otpRestrictionExpiry.getTime() - new Date().getTime();
        return res.status(400).send({
          success: false,
          message: `You have reached the limit of 3 OTP requests. Please try again after ${Math.ceil(
            timeLeft / (1000 * 60)
          )} minutes.`,
        });
      }

      user.otpCount = (user.otpCount || 0) + 1;

      if (user.otpCount >= 3) {
        user.otpRestrictionExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
        await user.save();
        await User.collection.getIndexes();
        return res.status(400).send({
          success: false,
          message:
            "You have reached the limit of OTP requests. Please try again after 2 hours.",
        });
      }

      if (email) {
        const htmlContent = otpEmailTemplate(otp);
        const emailResult = await sendEmail(
          email,
          "Welcome back to Salon! Your OTP for Account Verification",
          htmlContent
        );

        if (emailResult.success) {
          user.otp = otp;
          user.otpExpiry = otpExpires;
          user.isOtpVerified = false;
          await user.save();
        } else {
          return res.status(500).send({
            success: false,
            message: "Failed to send OTP email",
          });
        }
      } else {
        user.otp = otp;
        user.otpExpiry = otpExpires;
        user.isOtpVerified = false;
        await user.save();
      }
    } else {
      const userData = {
        otpExpiry: otpExpires,
        otp,
        otpCount: 1,
      };

      if (phone && phone.trim()) {
        userData.phone = phone.trim();
      }

      if (email && email.trim()) {
        userData.email = email.toLowerCase().trim();

        const htmlContent = otpEmailTemplate(otp);
        const emailResult = await sendEmail(
          email,
          "Welcome to Salon! Your OTP for Account Activation",
          htmlContent
        );

        if (!emailResult.success) {
          return res.status(500).send({
            success: false,
            message: "Failed to send OTP email",
          });
        }
      }

      const newUser = new User(userData);
      await newUser.save();
    }

    console.log(`OTP for ${phone || email}: ${otp}`);
    return res.status(201).send({
      success: true,
      otp,
      message: "OTP generated and sent successfully",
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    return res.status(500).send({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const verifyOtp = async (request, res) => {
  try {
    const { phone, email, otp } = request.body;

    if (!phone && !email) {
      return res.status(400).send({
        success: false,
        message: "Phone or email must be provided",
      });
    }

    const user = await User.findOne(
      phone ? { phone, isDeleted: false } : { email, isDeleted: false }
    );
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    if (user.otp !== otp || !user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).send({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.isOtpVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpCount = 0;
    if (user.resetPasswordRequest === true) {
      user.resetPasswordRequest = false;
    }
    await user.save();

    return res.status(200).send({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone must be provided",
      });
    }

    const query = {
      isDeleted: false,
      $or: [
        ...(email ? [{ email: email.toLowerCase().trim() }] : []),
        ...(phone ? [{ phone: phone.trim() }] : []),
      ],
    };

    const user = await User.findOne(query).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    if (!user.isRegistered) {
      return res.status(403).json({
        success: false,
        message: "User not registered. Please complete registration.",
      });
    }

    if (!user.isOtpVerified) {
      return res.status(403).json({
        success: false,
        message: "OTP not verified. Please verify your account first.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user.id, "user");

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      jwtToken: token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone must be provided",
      });
    }

    const query = {
      isDeleted: false,
      isRegistered: true,
      ...(phone && phone.trim() ? { phone: phone.trim() } : {}),
      ...(email && email.trim() ? { email: email.toLowerCase().trim() } : {}),
    };

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No registered account found with this email/phone",
      });
    }

    if (user.otpRestrictionExpiry && new Date() < user.otpRestrictionExpiry) {
      const timeLeft =
        user.otpRestrictionExpiry.getTime() - new Date().getTime();
      return res.status(400).json({
        success: false,
        message: `You have reached the limit of 3 OTP requests. Please try again after ${Math.ceil(
          timeLeft / (1000 * 60)
        )} minutes.`,
      });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otpCount = (user.otpCount || 0) + 1;

    if (user.otpCount >= 3) {
      user.otpRestrictionExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
      await user.save();
      return res.status(400).json({
        success: false,
        message:
          "You have reached the limit of OTP requests. Please try again after 2 hours.",
      });
    }

    user.resetPasswordRequest = true;
    user.otp = otp;
    user.otpExpiry = otpExpires;

    if (email && email.trim()) {
      const htmlContent = otpEmailTemplate(otp, "FORGOT_PASSWORD");
      const emailResult = await sendEmail(
        email,
        "Password Reset Request - Your OTP",
        htmlContent
      );

      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to send password reset email",
        });
      }
    }

    // Send OTP via SMS if phone is provided (you'll need to implement this)
    // if (phone && phone.trim()) {
    //   await sendSMS(phone, `Your OTP for password reset is: ${otp}`);
    // }

    await user.save();

    console.log(`Password reset OTP for ${phone || email}: ${otp}`);
    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully",
      otp,
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { email, phone, newPassword } = req.body;

    if ((!email && !phone) || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email/phone and new password are required",
      });
    }
    const query = {
      isDeleted: false,
      resetPasswordRequest: true,
      ...(phone && phone.trim() ? { phone: phone.trim() } : {}),
      ...(email && email.trim() ? { email: email.toLowerCase().trim() } : {}),
    };

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No password reset request found",
      });
    }
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const logoutUser = async (request, res) => {
  try {
    const token = request.token;

    if (!token) {
      return res.status(400).send({
        success: false,
        message: "No token provided",
      });
    }
    await Blacklist.create({ token });
    request.user = null;
    request.token = null;
    return res.status(200).send({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error logging out",
      error: error.message,
    });
  }
};

export const profileUpdate = async (req, res) => {
  let cloudinaryResult;

  try {
    // const { _id } = req.user;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    const { skillLevel, interestId, email, name, oldPassword, newPassword } =
      req.body;

    const file = req.file;
    if (file) {
      cloudinaryResult = await uploadToCloudinary(file);

      if (user.profile_picture.public_id) {
        await deleteFromCloudinary(user.profile_picture.public_id);
      }

      user.profile_picture = {
        public_id: cloudinaryResult.data?.public_id,
        url: cloudinaryResult.data?.url,
      };
    }

    if (skillLevel && Object.values(SkillLevel).includes(skillLevel)) {
      user.skillLevel = skillLevel;
    } else if (skillLevel) {
      return res.status(400).send({
        success: false,
        message: `Invalid skill level provided. Valid skill levels are: ${Object.values(
          SkillLevel
        ).join(", ")}`,
      });
    }

    if (interestId) {
      const interest = await Interest.findById(interestId);
      if (!interest) {
        return res.status(400).send({
          success: false,
          message: "Invalid interest ID provided. Interest not found.",
        });
      }
      user.interests = interestId;
    }
    if (email) user.email = email;
    if (name) user.name = name;

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).send({
          success: false,
          message: "Old password is incorrect",
        });
      }
      user.password = newPassword;
    }

    await user.save();

    let data;
    if (user.interests.length > 0) {
      data = await User.findOne({ _id: user._id })
        .populate({
          path: "interests",
          select: "name image.url",
        })
        .exec();
    }

    return res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      data: data ?? user,
    });
  } catch (error) {
    if (cloudinaryResult) {
      await deleteFromCloudinary(cloudinaryResult.data?.public_id);
    }
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllUsersAdmin = async (request, res) => {
  const { page = 1, limit = 10, search = "" } = request.query;

  try {
    const skip = (page - 1) * limit;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .skip(skip)
        .limit(limit)
        .select("-password")
        .populate("interests")
        .populate({
          path: "coursesEnrolled",
          populate: { path: "course" },
        })
        .populate("favoriteCourses"),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).send({
      success: true,
      message: "Users fetched successfully",
      data: users,
      pagination: {
        current_page: page,
        per_page: limit,
        total_items: totalUsers,
        total_pages: totalPages,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage,
      },
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

export const getUserById = async (request, res) => {
  const { id } = request.params;
  try {
    const user = await User.findOne({ _id: id }).select("-password");

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    return res.send({
      success: true,
      message: "User details fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res
      .status(500)
      .send({ success: false, message: "Error fetching user", error });
  }
};
export const getMe = async (request, res) => {
  const { _id } = request.user;

  try {
    const user = await User.findOne({ _id, isDeleted: false })
      .select("-password")
      .populate({ path: "interests", select: "name image.url" });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "User details fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res
      .status(500)
      .send({ success: false, message: "Error fetching user", error });
  }
};
export const deleteAccount = async (request, res) => {
  try {
    await request.user.softDelete();

    return res.status(200).send({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error deleting user account",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id, isDeleted: false });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    if (user.profile_picture) {
      await deleteFromCloudinary(user.profile_picture.public_id);
    }

    await user.deleteOne();
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error deleting user account",
      error: error.message,
    });
  }
};
