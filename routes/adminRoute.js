import express from "express";
import {
  adminDetails,
  adminLogin,
  adminLogout,
  registerAdmin,
} from "../controllers/adminController.js";
import {
  deleteUser,
  getAllUsersAdmin,
  getUserById,
} from "../controllers/userController.js";
import { authAdmin } from "../middlewares/auth.js";
import {
  deleteContact,
  getContacts,
} from "../controllers/contactController.js";
import {
  addInterest,
  deleteInterest,
  getInterest,
  getInterestByAdmin,
  getInterestById,
  updateInterest,
} from "../controllers/interestController.js";
import { singleUpload } from "../middlewares/multer.js";
import {
  addBanner,
  deleteBanner,
  getBannerById,
  getBanners,
  updateBanner,
} from "../controllers/bannerController.js";
import {
  addAnswer,
  createQuestion,
  deleteAnswer,
  deleteQuestion,
  getQuestionsByAdmin,
  updateQuestionAndAnswer,
} from "../controllers/questionController.js";
import {
  getAllReviews,
  updateReviewStatus,
} from "../controllers/courseController.js";
const router = express.Router();

router.post("/admin/create", registerAdmin);
router.post("/admin/login", adminLogin);
router.get("/admin/me", authAdmin, adminDetails);
router.delete("/admin/user/:id", authAdmin, deleteUser);
router.get("/admin/contacts", authAdmin, getContacts);
router.delete("/admin/contact/:id", authAdmin, deleteContact);
router.get("/admin/user/all", authAdmin, getAllUsersAdmin);
router.get("/admin/user/:id/view", authAdmin, getUserById);
router.post("/admin/interest/create", singleUpload, addInterest);
router.get("/admin/interest/all", authAdmin, getInterest);
router.get("/admin/interests", authAdmin, getInterestByAdmin);
router.delete("/admin/interest/:id/delete", authAdmin, deleteInterest);
router.get("/admin/interest/:id", authAdmin, getInterestById);
router.put(
  "/admin/interest/:id/update",
  authAdmin,
  singleUpload,
  updateInterest
);
router.get("/admin/logout", authAdmin, adminLogout);
router.get("/admin/banners", authAdmin, getBanners);
router.post("/admin/banner/create", authAdmin, singleUpload, addBanner);
router.put("/admin/:id/update", authAdmin, singleUpload, updateBanner);
router.get("/admin/banner/:id", authAdmin, getBannerById);
router.delete("/admin/:id/delete", authAdmin, deleteBanner);
router.post("/admin/question/create", authAdmin, createQuestion);
router.post("/admin/question/:id/answer", authAdmin, addAnswer);
router.delete("/admin/question/:id/delete", authAdmin, deleteQuestion);
router.delete(
  "/admin/question/:id/answer/:answerId/delete",
  authAdmin,
  deleteAnswer
);
router.put(
  "/admim/:id?/question/:answerId?/update",
  authAdmin,
  updateQuestionAndAnswer
);
router.get("/admin/question/all", authAdmin, getQuestionsByAdmin);
router.get("/admin/reviews", authAdmin, getAllReviews);
router.put("/admin/reviews/:id/status", authAdmin, updateReviewStatus);
export { router as adminRoutes };
