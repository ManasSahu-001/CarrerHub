import { Router } from "express";
import {
  createPost,
  getFeed,
  getPost,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

// ── Public ─────────────────────────────────────────────────────────────────
router.get("/",               getFeed);       // Public feed (auth optional for isLiked flag)
router.get("/user/:userId",   getUserPosts);
router.get("/:postId",        getPost);

// ── Protected ──────────────────────────────────────────────────────────────
router.use(verifyJWT);

router.post("/",              upload.single("image"), createPost);
router.put("/:postId",        updatePost);
router.delete("/:postId",     deletePost);
router.post("/:postId/like",  toggleLike);
router.post("/:postId/comments",              addComment);
router.delete("/:postId/comments/:commentId", deleteComment);

export default router;
