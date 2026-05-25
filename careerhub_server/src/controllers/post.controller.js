import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../services/cloudinary.service.js";

// ---------------------------------------------------------------------------
// POST /api/v1/posts  — create a post
// ---------------------------------------------------------------------------
export const createPost = asyncHandler(async (req, res) => {
  const { content, visibility } = req.body;
  if (!content?.trim()) throw new ApiError(400, "Post content is required");

  let image = { url: "", publicId: "" };

  if (req.file) {
    const uploaded = await uploadOnCloudinary(req.file.path, "prolink/posts");
    if (uploaded) {
      image = { url: uploaded.secure_url, publicId: uploaded.public_id };
    }
  }

  const post = await Post.create({
    author: req.user._id,
    content: content.trim(),
    image,
    visibility: visibility || "public",
  });

  await post.populate("author", "username fullName avatar headline");

  return res.status(201).json(
    new ApiResponse(201, post, "Post created")
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/posts  — paginated public feed
// ---------------------------------------------------------------------------
export const getFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [posts, total] = await Promise.all([
    Post.find({ visibility: "public" })
      .populate("author", "username fullName avatar headline")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean({ virtuals: true }),
    Post.countDocuments({ visibility: "public" }),
  ]);

  // Tag whether current user liked each post
  const postsWithLiked = posts.map((post) => ({
    ...post,
    isLiked: req.user
      ? post.likes.some((id) => id.toString() === req.user._id.toString())
      : false,
  }));

  return res.status(200).json(
    new ApiResponse(200, {
      posts: postsWithLiked,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    }, "Feed fetched")
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/posts/:postId  — single post with comments
// ---------------------------------------------------------------------------
export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId)
    .populate("author", "username fullName avatar headline")
    .lean({ virtuals: true });

  if (!post) throw new ApiError(404, "Post not found");

  const comments = await Comment.find({ post: postId })
    .populate("author", "username fullName avatar")
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, { post, comments }, "Post fetched")
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/posts/user/:userId  — all posts by a specific user
// ---------------------------------------------------------------------------
export const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [posts, total] = await Promise.all([
    Post.find({ author: userId })
      .populate("author", "username fullName avatar headline")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean({ virtuals: true }),
    Post.countDocuments({ author: userId }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { posts, total }, "User posts fetched")
  );
});

// ---------------------------------------------------------------------------
// PUT /api/v1/posts/:postId  — edit own post
// ---------------------------------------------------------------------------
export const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content, visibility } = req.body;

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");
  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own posts");
  }

  if (content !== undefined) post.content = content.trim();
  if (visibility !== undefined) post.visibility = visibility;
  await post.save();

  return res.status(200).json(
    new ApiResponse(200, post, "Post updated")
  );
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/posts/:postId  — delete own post
// ---------------------------------------------------------------------------
export const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");
  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own posts");
  }

  // Clean up image from Cloudinary
  if (post.image?.publicId) {
    await deleteFromCloudinary(post.image.publicId);
  }

  await Post.deleteOne({ _id: postId });
  // Clean up all comments on this post
  await Comment.deleteMany({ post: postId });

  return res.status(200).json(
    new ApiResponse(200, {}, "Post deleted")
  );
});

// ---------------------------------------------------------------------------
// POST /api/v1/posts/:postId/like  — toggle like
// ---------------------------------------------------------------------------
export const toggleLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const alreadyLiked = post.likes.includes(userId);

  if (alreadyLiked) {
    post.likes.pull(userId);     // Remove like
  } else {
    post.likes.push(userId);     // Add like
  }

  await post.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, {
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    }, alreadyLiked ? "Post unliked" : "Post liked")
  );
});

// ---------------------------------------------------------------------------
// POST /api/v1/posts/:postId/comments  — add comment
// ---------------------------------------------------------------------------
export const addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) throw new ApiError(400, "Comment cannot be empty");

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const comment = await Comment.create({
    post: postId,
    author: req.user._id,
    content: content.trim(),
  });

  // Increment denormalized comment count
  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

  await comment.populate("author", "username fullName avatar");

  return res.status(201).json(
    new ApiResponse(201, comment, "Comment added")
  );
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/posts/:postId/comments/:commentId  — delete own comment
// ---------------------------------------------------------------------------
export const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");
  if (comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own comments");
  }

  await Comment.deleteOne({ _id: commentId });
  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -1 } });

  return res.status(200).json(
    new ApiResponse(200, {}, "Comment deleted")
  );
});
