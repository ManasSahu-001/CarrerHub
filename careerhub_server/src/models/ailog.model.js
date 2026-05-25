import mongoose, { Schema } from "mongoose";

/**
 * AILog — tracks every Gemini API call
 * WHY log AI calls? Monitor token usage, latency, and per-user limits.
 * Future: enforce daily limits, show users their AI usage history.
 */
const aiLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["resume_summary", "post_improve"],
      required: true,
    },
    promptLength:  { type: Number },   // chars sent
    responseLength:{ type: Number },   // chars received
    latencyMs:     { type: Number },   // API call duration
    success:       { type: Boolean, default: true },
    errorMessage:  { type: String },   // if success=false
  },
  { timestamps: true }
);

export default mongoose.model("AILog", aiLogSchema);
