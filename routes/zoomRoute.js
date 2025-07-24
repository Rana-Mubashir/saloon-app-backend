import express from 'express'
import { createZoomMeeting } from "../controllers/zoomController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post('/create-meeting', createZoomMeeting)

export { router as zoomRoutes };
