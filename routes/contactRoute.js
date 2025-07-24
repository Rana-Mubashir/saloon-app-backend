import express from "express";
import { auth } from "../middlewares/auth.js";
import { createContact } from "../controllers/contactController.js";
const router = express.Router();

router.post("/contact/create", auth, createContact);

export { router as contactRoutes };
