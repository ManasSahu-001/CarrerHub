import mongoose, { Schema } from "mongoose";
import { PostVisibility } from "../utils/constants.js";

const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      maxlength: [2000, "Post cannot exceed 2000 characters"],
      trim: true,
    },
    image: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" }, // For Cloudinary deletion
    },
    // WHY store likes as array of ObjectIds?
    // Lets us check "did THIS user like it?" in O(1) with .includes()
    // and get count with .length — no extra query needed
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // Denormalized comment count for fast feed rendering
    // (avoids COUNT query on comments collection on every feed load)
    commentsCount: { type: Number, default: 0 },

    visibility: {
      type: String,
      enum: Object.values(PostVisibility),
      default: PostVisibility.PUBLIC,
    },

    // Flag for soft-delete (future)
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

// Fast feed query: latest posts, not deleted
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

// Virtual: like count from array length (no extra DB field to keep in sync)
postSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

postSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Post", postSchema);
