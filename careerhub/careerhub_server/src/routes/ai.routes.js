import { Router } from "express";
import {
  generateResumeSummary,
  improvePost,
} from "../controllers/ai.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// All AI routes require authentication
router.use(verifyJWT);

router.post("/resume-summary", generateResumeSummary);
router.post("/improve-post",   improvePost);

export default router;
