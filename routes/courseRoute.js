import express from "express";
import {
  addCoursesLessons,
  deleteCourse,
  deleteLesson,
  getAllOnlineLessons,
  getCoursesAdmin,
  getCoursesById,
  getLessons,
  updateCourse,
  updateLesson,
} from "../controllers/courseController.js";
import { authAdmin } from "../middlewares/auth.js";
import { dynamicFieldsUpload } from "../middlewares/multer.js";
const router = express.Router();

router.post(
  "/course/create",
  authAdmin,
  dynamicFieldsUpload,
  addCoursesLessons
);
router.get("/course/all", authAdmin, getCoursesAdmin);
router.get("/course/:id", authAdmin, getCoursesById);
router.put("/course/:id/update", authAdmin, dynamicFieldsUpload, updateCourse);
router.delete("/course/:id/delete", authAdmin, deleteCourse);
router.post(
  "/course/:id/lesson/create",
  dynamicFieldsUpload,
  authAdmin,
  addCoursesLessons
);
router.put(
  "/course/:id/lesson/:lessonId/update",
  dynamicFieldsUpload,
  authAdmin,
  updateLesson
);
router.get("/course/:id/lesson/all", authAdmin, getLessons);
router.delete("/course/:id/lesson/:lessonId/delete", authAdmin, deleteLesson);
router.get("/cource/onlineMeetings", getAllOnlineLessons)
export { router as courseRoutes };
