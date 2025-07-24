import jwt from "jsonwebtoken";
import ffmpeg from "fluent-ffmpeg";
import { User } from "../models/userModel.js";

/**
 * Generates a 6-digit OTP (One Time Password).
 *
 * @returns {number} A randomly generated 6-digit OTP.
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
/**
 * Generates a JWT token for the user.
 *
 * @param user - The user object for which the token is to be generated.
 * @returns The generated JWT token.
 */
const generateToken = (userId, type) => {
  const payload = {
    id: userId,
  };

  const secret =
    type === "user"
      ? process.env.JWT_SECRET || "makeupsalon"
      : process.env.JWT_SECRETADMIN || "makeupsalonadmin";

  const token = jwt.sign(payload, secret, { expiresIn: "5d" });

  return token;
};

/**
 * Gets the duration of a video file.
 *
 * @param {Buffer} videoBuffer - The buffer of the video file.
 * @returns {Promise<number>} A promise that resolves with the duration of the video in seconds.
 */
const getVideoDuration = (videoBuffer) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoBuffer, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
};
const isValidCourseType = (type) => {
  return ["physical", "live", "video","online"].includes(type);
};

const attachEnrollmentCounts = async (courses) => {
  const courseIds = courses.map((course) => course._id);

  const enrollmentCounts = await User.aggregate([
    { $unwind: "$coursesEnrolled" },
    { $match: { "coursesEnrolled.course": { $in: courseIds } } },
    {
      $group: {
        _id: "$coursesEnrolled.course",
        count: { $sum: 1 },
      },
    },
  ]);

  const enrollmentCountMap = enrollmentCounts.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr.count;
    return acc;
  }, {});

  courses.forEach((course) => {
    course.enrollmentCount = enrollmentCountMap[course._id.toString()] || 0;
  });

  return courses;
};

export {
  generateOtp,
  generateToken,
  getVideoDuration,
  isValidCourseType,
  attachEnrollmentCounts,
};
