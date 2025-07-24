import express from "express";
import {
  addAnswer,
  createQuestion,
  deleteAnswer,
  deleteQuestion,
  getQuestions,
} from "../controllers/questionController.js";
import { auth } from "../middlewares/auth.js";
const router = express.Router();

router.post("/question/create", auth, createQuestion);
router.get("/questions", auth, getQuestions);
router.post("/question/:id/answer", auth, addAnswer);
router.delete("/question/:id/delete", auth, deleteQuestion);
router.delete("/question/:id/answer/:answerId/delete", auth, deleteAnswer);
export { router as questionRoutes };
