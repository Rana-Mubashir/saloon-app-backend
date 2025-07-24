import express from "express";
import {
  loginUser,
  register,
  generateUserOtp,
  verifyOtp,
  profileUpdate,
  getUserById,
  logoutUser,
  deleteAccount,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { auth } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";
import {
  enRollCourse,
  favouriteCourses,
  filterCourses,
  getCourses,
  getCoursesById,
  getEnrolledCourseById,
  getEnrolledCourses,
  getFavouriteCourses,
  getLatestCourse,
  getLessons,
  getLesssonById,
  getPopularCourses,
  searchCourses,
  unEnrollCourse,
  updateLessonProgress,
} from "../controllers/courseController.js";
import { getInterest } from "../controllers/interestController.js";
import { getFAQs } from "../controllers/questionController.js";
const router = express.Router();

router.post("/user/send-otp", generateUserOtp);
router.post("/user/verify-otp", verifyOtp);
router.post("/user/register", register);
router.post("/user/login", loginUser);
router.post("/user/forgot-password", forgotPassword);
router.post("/user/reset-password", resetPassword);
router.put("/user/profile", auth, singleUpload, profileUpdate);
router.get("/user/:id", getUserById);
router.get("/user/profile/me", auth, getMe);
router.post("/user/logout", auth, logoutUser);
router.delete("/user/delete", auth, deleteAccount);
router.post("/user/course/:id/enroll", auth, singleUpload, enRollCourse);
router.post(
  "/user/enrollments/:enrollmentId/lessons/:lessonId",
  auth,
  updateLessonProgress
);
router.get("/user/courses/enroll", auth, getEnrolledCourses);
router.get("/user/enroll/course/:id", auth, getEnrolledCourseById);
router.post("/user/course/:id/unenroll", auth, unEnrollCourse);
router.get("/user/courses/all", auth, getCourses);
router.get("/user/courses/popular", auth, getPopularCourses);
router.get("/user/courses/latest", auth, getLatestCourse);
router.get("/user/courses/:id", auth, getCoursesById);
router.get("/user/filter/courses", auth, filterCourses);
router.get("/user/search/course", auth, searchCourses);
router.get("/user/courses/lessons", auth, getLessons);
router.get("/user/courses/:id/lesson/:lessonId", auth, getLesssonById);
router.get("/user/interest/all", auth, getInterest);
router.get("/user/course/all", auth, getCourses);
router.get("/user/favourite/course/all", auth, getFavouriteCourses);
router.patch("/user/favourite/course/:id", auth, favouriteCourses);
router.get("/user/faqs/all", auth, getFAQs);

export { router as userRoutes };
