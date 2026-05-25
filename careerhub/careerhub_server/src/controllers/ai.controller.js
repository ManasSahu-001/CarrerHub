import Profile from "../models/profile.model.js";
import AILog from "../models/ailog.model.js";
import { generateAIResponse } from "../services/ai.service.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ---------------------------------------------------------------------------
// POST /api/v1/ai/resume-summary
// Generate a professional resume summary from the user's profile data
// ---------------------------------------------------------------------------
export const generateResumeSummary = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user._id });
  if (!profile) throw new ApiError(404, "Profile not found. Please complete your profile first.");

  // Build structured prompt — server-side, never trust user-provided prompt
  const prompt = buildResumeSummaryPrompt(req.user, profile);

  const start = Date.now();
  let summary = "";
  let success = true;
  let errorMessage = "";

  try {
    summary = await generateAIResponse(prompt);
  } catch (err) {
    success = false;
    errorMessage = err.message;
    // Log the failure but don't crash the request
  }

  const latencyMs = Date.now() - start;

  // Log every AI call for usage tracking
  await AILog.create({
    userId: req.user._id,
    type: "resume_summary",
    promptLength: prompt.length,
    responseLength: summary.length,
    latencyMs,
    success,
    errorMessage: success ? undefined : errorMessage,
  });

  if (!success) {
    throw new ApiError(503, "AI service is temporarily unavailable. Please try again.");
  }

  // Persist the generated summary to profile (user can regenerate anytime)
  await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { resumeSummary: summary } }
  );

  return res.status(200).json(
    new ApiResponse(200, { summary }, "Resume summary generated successfully")
  );
});

// ---------------------------------------------------------------------------
// POST /api/v1/ai/improve-post  (Phase 2 — wired now, ready to use)
// ---------------------------------------------------------------------------
export const improvePost = asyncHandler(async (req, res) => {
  const { content, tone = "professional" } = req.body;
  if (!content?.trim()) throw new ApiError(400, "Post content is required");

  const prompt = `You are a professional LinkedIn content writer.
Improve the following post draft. Make it engaging, clear, and ${tone} in tone.
Keep it under 250 words. Do not add hashtags unless they were in the original.
Return only the improved post text — no preamble or explanation.

Original post:
"${content}"`;

  const start = Date.now();
  let improved = "";
  let success = true;
  let errorMessage = "";

  try {
    improved = await generateAIResponse(prompt);
  } catch (err) {
    success = false;
    errorMessage = err.message;
  }

  const latencyMs = Date.now() - start;

  await AILog.create({
    userId: req.user._id,
    type: "post_improve",
    promptLength: prompt.length,
    responseLength: improved.length,
    latencyMs,
    success,
    errorMessage: success ? undefined : errorMessage,
  });

  if (!success) {
    throw new ApiError(503, "AI service is temporarily unavailable. Please try again.");
  }

  return res.status(200).json(
    new ApiResponse(200, { improved }, "Post improved successfully")
  );
});

// ---------------------------------------------------------------------------
// Helper: build resume summary prompt from profile data
// ---------------------------------------------------------------------------
const buildResumeSummaryPrompt = (user, profile) => {
  const skills = profile.skills?.join(", ") || "not specified";

  const education = profile.education
    ?.map((e) => `${e.degree} in ${e.field} from ${e.school} (${e.startYear}–${e.endYear || "present"})`)
    .join("; ") || "not specified";

  const experience = profile.experience
    ?.map((e) => `${e.role} at ${e.company}`)
    .join("; ") || "no experience listed";

  const projects = profile.projects
    ?.map((p) => `${p.title} (${p.techStack?.join(", ")})`)
    .join("; ") || "no projects listed";

  return `You are an expert resume writer for tech professionals and fresh graduates.
Write a compelling, concise 3–4 sentence professional resume summary for the following person.
Write in first person. Focus on skills, experience, and value they bring. Be specific, not generic.

Name: ${user.fullName || user.username}
Headline: ${profile.headline || "not specified"}
Skills: ${skills}
Education: ${education}
Experience: ${experience}
Projects: ${projects}
Location: ${profile.location || "not specified"}

Return only the summary text. No bullet points, no headers, no preamble.`;
};
