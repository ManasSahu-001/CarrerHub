import { Router } from "express";
import {
  getUserByUsername,
  updateAvatar,
  updateCoverPhoto,
  toggleFollow,
  getFollowers,
  getFollowing,
  getFollowingStatus,
  sendConnectionRequest,
  acceptConnection,
  rejectConnection,
  withdrawConnection,
  getPendingRequests,
  getConnections,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

// ── Public routes (no auth required) ──────────────────────────────────────
// NOTE: These MUST be declared before any wildcard param routes like /:username
// to prevent "connections", "avatar", etc. from being caught as a username.
// However, /:username must also come AFTER specific static paths.
// Fix: Move all specific static paths above /:username.

router.get("/connections/pending",   verifyJWT, getPendingRequests);
router.get("/connections/all",       verifyJWT, getConnections);
router.put("/connections/:connectionId/accept",  verifyJWT, acceptConnection);
router.put("/connections/:connectionId/reject",  verifyJWT, rejectConnection);
router.delete("/connections/:connectionId/withdraw", verifyJWT, withdrawConnection);

// Image uploads (protected)
router.post("/avatar", verifyJWT, upload.single("avatar"), updateAvatar);
router.post("/cover",  verifyJWT, upload.single("cover"),  updateCoverPhoto);

// ── Public param routes (wildcard — must come after all static paths) ──────
router.get("/:username",              getUserByUsername);
router.get("/:userId/followers",      getFollowers);
router.get("/:userId/following",      getFollowing);

// ── Protected param routes ─────────────────────────────────────────────────
router.get("/:targetId/following-status", verifyJWT, getFollowingStatus);
router.post("/:userId/follow",        verifyJWT, toggleFollow);
router.post("/:userId/connect",       verifyJWT, sendConnectionRequest);

export default router;
