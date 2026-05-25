import mongoose, { Schema } from "mongoose";

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const educationSchema = new Schema({
  school:    { type: String, required: true, trim: true },
  degree:    { type: String, required: true, trim: true }, // e.g. "B.Tech"
  field:     { type: String, required: true, trim: true }, // e.g. "Computer Science"
  startYear: { type: Number, required: true },
  endYear:   { type: Number },                              // undefined = currently studying
  current:   { type: Boolean, default: false },
  grade:     { type: String, trim: true },                  // e.g. "8.5 CGPA"
  activities:{ type: String, trim: true },
}, { _id: true });

const experienceSchema = new Schema({
  company:     { type: String, required: true, trim: true },
  role:        { type: String, required: true, trim: true },
  description: { type: String, trim: true, maxlength: 500 },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date },                               // undefined = currently working
  current:     { type: Boolean, default: false },
  location:    { type: String, trim: true },
}, { _id: true });

const projectSchema = new Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true, maxlength: 500 },
  techStack:   [{ type: String, trim: true }],               // ["React", "Node.js", ...]
  githubUrl:   { type: String, trim: true },
  liveUrl:     { type: String, trim: true },
  startDate:   { type: Date },
  endDate:     { type: Date },
}, { _id: true });

// ── Main Profile schema ───────────────────────────────────────────────────────

const profileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,               // One profile per user
      index: true,
    },

    // ── Basic info (mirrors some user fields for fast reads) ──────────────────
    bio:      { type: String, maxlength: 300, default: "" },
    headline: { type: String, maxlength: 100, default: "" }, // "Full Stack Dev @ XYZ"
    location: { type: String, default: "" },
    website:  { type: String, default: "" },

    // ── Platform links ────────────────────────────────────────────────────────
    // WHY separate object? Easy to add new platforms later without schema change
    platformLinks: {
      github:     { type: String, default: "" },
      leetcode:   { type: String, default: "" },
      codeforces: { type: String, default: "" },
      linkedin:   { type: String, default: "" },
      portfolio:  { type: String, default: "" },
    },

    // ── Skills ────────────────────────────────────────────────────────────────
    skills: [{ type: String, trim: true }],                   // ["JavaScript","MongoDB",...]

    // ── Sections ─────────────────────────────────────────────────────────────
    education:  [educationSchema],
    experience: [experienceSchema],
    projects:   [projectSchema],

    // ── AI-generated resume summary (stored after generation) ─────────────────
    resumeSummary: { type: String, default: "" },

    // ── Stats (denormalized for fast reads on profile page) ───────────────────
    followersCount:   { type: Number, default: 0 },
    followingCount:   { type: Number, default: 0 },
    connectionsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
