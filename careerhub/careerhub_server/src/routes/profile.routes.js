import { Router } from "express";
import {
  getProfile,
  getMyProfile,
  updateBasicInfo,
  updatePlatformLinks,
  updateSkills,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  addProject,
  updateProject,
  deleteProject,
  searchProfiles,
} from "../controllers/profile.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// ── Public ─────────────────────────────────────────────────────────────────
router.get("/search",        searchProfiles);
router.get("/me/profile",        verifyJWT, getMyProfile);
router.get("/:username",     getProfile);

// ── Protected ──────────────────────────────────────────────────────────────
router.use(verifyJWT); // All routes below require auth

router.put("/basic",         updateBasicInfo);
router.put("/platform-links",updatePlatformLinks);
router.put("/skills",        updateSkills);

// Education
router.post("/education",              addEducation);
router.put("/education/:eduId",        updateEducation);
router.delete("/education/:eduId",     deleteEducation);

// Experience
router.post("/experience",             addExperience);
router.put("/experience/:expId",       updateExperience);
router.delete("/experience/:expId",    deleteExperience);

// Projects
router.post("/projects",               addProject);
router.put("/projects/:projectId",     updateProject);
router.delete("/projects/:projectId",  deleteProject);

export default router;
