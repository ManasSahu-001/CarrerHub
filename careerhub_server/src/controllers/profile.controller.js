import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ---------------------------------------------------------------------------
// GET /api/v1/profile/:username  — view any public profile
// ---------------------------------------------------------------------------
export const getProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select(
    "-password -refreshToken -emailVerificationToken -forgotPasswordToken"
  );
  if (!user) throw new ApiError(404, "User not found");

  const profile = await Profile.findOne({ userId: user._id });
  if (!profile) throw new ApiError(404, "Profile not found");

  return res.status(200).json(
    new ApiResponse(200, { user, profile }, "Profile fetched successfully")
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/profile/me  — own full profile
// ---------------------------------------------------------------------------
export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user._id });
  if (!profile) throw new ApiError(404, "Profile not found");

  return res.status(200).json(
    new ApiResponse(200, { user: req.user, profile }, "Profile fetched")
  );
});

// ---------------------------------------------------------------------------
// PUT /api/v1/profile/basic  — update bio, headline, location, website
// ---------------------------------------------------------------------------
export const updateBasicInfo = asyncHandler(async (req, res) => {
  const { bio, headline, location, website, fullName } = req.body;

  // Update user's fullName if provided
  if (fullName !== undefined) {
    await User.findByIdAndUpdate(req.user._id, { fullName });
  }

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    {
      $set: {
        ...(bio !== undefined && { bio }),
        ...(headline !== undefined && { headline }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, profile, "Basic info updated")
  );
});

// ---------------------------------------------------------------------------
// PUT /api/v1/profile/platform-links  — update GitHub, LeetCode, etc.
// ---------------------------------------------------------------------------
export const updatePlatformLinks = asyncHandler(async (req, res) => {
  const { github, leetcode, codeforces, linkedin, portfolio } = req.body;

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    {
      $set: {
        ...(github     !== undefined && { "platformLinks.github":     github }),
        ...(leetcode   !== undefined && { "platformLinks.leetcode":   leetcode }),
        ...(codeforces !== undefined && { "platformLinks.codeforces": codeforces }),
        ...(linkedin   !== undefined && { "platformLinks.linkedin":   linkedin }),
        ...(portfolio  !== undefined && { "platformLinks.portfolio":  portfolio }),
      },
    },
    { new: true, upsert: true }
  );

  return res.status(200).json(
    new ApiResponse(200, profile, "Platform links updated")
  );
});

// ---------------------------------------------------------------------------
// PUT /api/v1/profile/skills  — replace entire skills array
// ---------------------------------------------------------------------------
export const updateSkills = asyncHandler(async (req, res) => {
  const { skills } = req.body;
  if (!Array.isArray(skills)) throw new ApiError(400, "Skills must be an array");

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { skills } },
    { new: true, upsert: true }
  );

  return res.status(200).json(
    new ApiResponse(200, profile, "Skills updated")
  );
});

// ---------------------------------------------------------------------------
// POST /api/v1/profile/education  — add education entry
// ---------------------------------------------------------------------------
export const addEducation = asyncHandler(async (req, res) => {
  const { school, degree, field, startYear, endYear, current, grade, activities } = req.body;

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    {
      $push: {
        education: { school, degree, field, startYear, endYear, current, grade, activities },
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  return res.status(201).json(
    new ApiResponse(201, profile, "Education added")
  );
});

// ---------------------------------------------------------------------------
// PUT /api/v1/profile/education/:eduId  — edit education entry
// ---------------------------------------------------------------------------
export const updateEducation = asyncHandler(async (req, res) => {
  const { eduId } = req.params;
  const updates = req.body;

  // Build $set keys for the specific subdocument
  const setFields = {};
  Object.keys(updates).forEach((key) => {
    setFields[`education.$.${key}`] = updates[key];
  });

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id, "education._id": eduId },
    { $set: setFields },
    { new: true, runValidators: true }
  );

  if (!profile) throw new ApiError(404, "Education entry not found");

  return res.status(200).json(
    new ApiResponse(200, profile, "Education updated")
  );
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/profile/education/:eduId
// ---------------------------------------------------------------------------
export const deleteEducation = asyncHandler(async (req, res) => {
  const { eduId } = req.params;

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { education: { _id: eduId } } },
    { new: true }
  );

  if (!profile) throw new ApiError(404, "Profile not found");

  return res.status(200).json(
    new ApiResponse(200, profile, "Education entry removed")
  );
});

// ---------------------------------------------------------------------------
// POST /api/v1/profile/experience  — add experience entry
// ---------------------------------------------------------------------------
export const addExperience = asyncHandler(async (req, res) => {
  const { company, role, description, startDate, endDate, current, location } = req.body;

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    {
      $push: {
        experience: { company, role, description, startDate, endDate, current, location },
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  return res.status(201).json(
    new ApiResponse(201, profile, "Experience added")
  );
});

// ---------------------------------------------------------------------------
// PUT /api/v1/profile/experience/:expId
// ---------------------------------------------------------------------------
export const updateExperience = asyncHandler(async (req, res) => {
  const { expId } = req.params;
  const updates = req.body;

  const setFields = {};
  Object.keys(updates).forEach((key) => {
    setFields[`experience.$.${key}`] = updates[key];
  });

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id, "experience._id": expId },
    { $set: setFields },
    { new: true }
  );

  if (!profile) throw new ApiError(404, "Experience entry not found");

  return res.status(200).json(
    new ApiResponse(200, profile, "Experience updated")
  );
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/profile/experience/:expId
// ---------------------------------------------------------------------------
export const deleteExperience = asyncHandler(async (req, res) => {
  const { expId } = req.params;

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { experience: { _id: expId } } },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, profile, "Experience removed")
  );
});

// ---------------------------------------------------------------------------
// POST /api/v1/profile/projects  — add project
// ---------------------------------------------------------------------------
export const addProject = asyncHandler(async (req, res) => {
  const { title, description, techStack, githubUrl, liveUrl, startDate, endDate } = req.body;

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    {
      $push: {
        projects: { title, description, techStack, githubUrl, liveUrl, startDate, endDate },
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  return res.status(201).json(
    new ApiResponse(201, profile, "Project added")
  );
});

// ---------------------------------------------------------------------------
// PUT /api/v1/profile/projects/:projectId
// ---------------------------------------------------------------------------
export const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const updates = req.body;

  const setFields = {};
  Object.keys(updates).forEach((key) => {
    setFields[`projects.$.${key}`] = updates[key];
  });

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id, "projects._id": projectId },
    { $set: setFields },
    { new: true }
  );

  if (!profile) throw new ApiError(404, "Project not found");

  return res.status(200).json(
    new ApiResponse(200, profile, "Project updated")
  );
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/profile/projects/:projectId
// ---------------------------------------------------------------------------
export const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { projects: { _id: projectId } } },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, profile, "Project removed")
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/profile/search?q=keyword&skills=React,Node
// ---------------------------------------------------------------------------
export const searchProfiles = asyncHandler(async (req, res) => {
  const { q, skills, page = 1, limit = 10 } = req.query;

  // Build query — search by username, fullName, headline, or skills
  const userQuery = {};
  if (q) {
    userQuery.$or = [
      { username:  { $regex: q, $options: "i" } },
      { fullName:  { $regex: q, $options: "i" } },
    ];
  }

  const matchingUsers = await User.find(userQuery).select("_id").lean();
  const userIds = matchingUsers.map((u) => u._id);

  const profileQuery = { userId: { $in: userIds } };
  if (q) {
    // Also search headline
    profileQuery.$or = [
      { userId: { $in: userIds } },
      { headline: { $regex: q, $options: "i" } },
    ];
  }
  if (skills) {
    const skillArr = skills.split(",").map((s) => s.trim());
    profileQuery.skills = { $in: skillArr.map((s) => new RegExp(s, "i")) };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [profiles, total] = await Promise.all([
    Profile.find(profileQuery)
      .populate("userId", "username fullName avatar")
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Profile.countDocuments(profileQuery),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      profiles,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    }, "Search results")
  );
});
