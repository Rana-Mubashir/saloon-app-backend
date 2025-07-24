import express from "express";
import { auth } from "../middlewares/auth.js";
import { getBanners } from "../controllers/bannerController.js";
const router = express.Router();

router.get("/banners", auth, getBanners);

export { router as bannerRoutes };
