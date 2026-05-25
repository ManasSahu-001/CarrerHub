import mongoose, { Schema } from "mongoose";

/**
 * Follow — Twitter-style one-way follow
 * Different from Connection (which is mutual/two-way).
 *
 * follower  = the person who pressed "Follow"
 * following = the person being followed
 */
const followSchema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent a user from following the same person twice
followSchema.index({ follower: 1, following: 1 }, { unique: true });
// Fast query: "all users X is following"
followSchema.index({ follower: 1 });
// Fast query: "all followers of user X"
followSchema.index({ following: 1 });

export default mongoose.model("Follow", followSchema);
