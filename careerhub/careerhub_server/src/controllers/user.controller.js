import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import Follow from "../models/follow.model.js";
import Connection from "../models/connection.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../services/cloudinary.service.js";
import { ConnectionStatus } from "../utils/constants.js";

// ---------------------------------------------------------------------------
// POST /api/v1/users/avatar  — upload/replace avatar
// ---------------------------------------------------------------------------
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image file provided");

  const user = await User.findById(req.user._id);

  // Delete old avatar from Cloudinary if it exists
  if (user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId);
  }

  const uploaded = await uploadOnCloudinary(req.file.path, "prolink/avatars");
  if (!uploaded) throw new ApiError(500, "Image upload failed");

  user.avatar = { url: uploaded.secure_url, publicId: uploaded.public_id };
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, { avatar: user.avatar }, "Avatar updated")
  );
});

// ---------------------------------------------------------------------------
// POST /api/v1/users/cover  — upload/replace cover photo
// ---------------------------------------------------------------------------
export const updateCoverPhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image file provided");

  const user = await User.findById(req.user._id);

  if (user.coverPhoto?.publicId) {
    await deleteFromCloudinary(user.coverPhoto.publicId);
  }

  const uploaded = await uploadOnCloudinary(req.file.path, "prolink/covers");
  if (!uploaded) throw new ApiError(500, "Image upload failed");

  user.coverPhoto = { url: uploaded.secure_url, publicId: uploaded.public_id };
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, { coverPhoto: user.coverPhoto }, "Cover photo updated")
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/users/:username  — get public user card
// ---------------------------------------------------------------------------
export const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select(
    "-password -refreshToken -emailVerificationToken -forgotPasswordToken"
  );
  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(
    new ApiResponse(200, user, "User fetched")
  );
});

// ---------------------------------------------------------------------------
// POST /api/v1/users/:userId/follow  — follow or unfollow
// ---------------------------------------------------------------------------
export const toggleFollow = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user._id;

  if (userId === followerId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) throw new ApiError(404, "User not found");

  const existing = await Follow.findOne({ follower: followerId, following: userId });

  if (existing) {
    // Already following — unfollow
    await Follow.deleteOne({ _id: existing._id });

    // Decrement denormalized counts on both profiles
    await Profile.findOneAndUpdate({ userId: followerId }, { $inc: { followingCount: -1 } });
    await Profile.findOneAndUpdate({ userId },            { $inc: { followersCount: -1 } });

    return res.status(200).json(
      new ApiResponse(200, { following: false }, "Unfollowed successfully")
    );
  }

  // Not following — follow
  await Follow.create({ follower: followerId, following: userId });
  await Profile.findOneAndUpdate({ userId: followerId }, { $inc: { followingCount: 1 } }, { upsert: true });
  await Profile.findOneAndUpdate({ userId },             { $inc: { followersCount: 1 } }, { upsert: true });

  return res.status(200).json(
    new ApiResponse(200, { following: true }, "Followed successfully")
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/users/:userId/followers
// ---------------------------------------------------------------------------
export const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [followers, total] = await Promise.all([
    Follow.find({ following: userId })
      .populate("follower", "username fullName avatar headline")
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Follow.countDocuments({ following: userId }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { followers, total }, "Followers fetched")
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/users/:userId/following
// ---------------------------------------------------------------------------
export const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [following, total] = await Promise.all([
    Follow.find({ follower: userId })
      .populate("following", "username fullName avatar headline")
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Follow.countDocuments({ follower: userId }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { following, total }, "Following fetched")
  );
});

// ---------------------------------------------------------------------------
// POST /api/v1/users/:userId/connect  — send connection request
// ---------------------------------------------------------------------------
export const sendConnectionRequest = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const requesterId = req.user._id;

  if (userId === requesterId.toString()) {
    throw new ApiError(400, "You cannot connect with yourself");
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) throw new ApiError(404, "User not found");

  const existing = await Connection.findOne({
    $or: [
      { requester: requesterId, recipient: userId },
      { requester: userId, recipient: requesterId },
    ],
  });

  if (existing) {
    if (existing.status === ConnectionStatus.ACCEPTED) {
      throw new ApiError(409, "You are already connected");
    }
    if (existing.status === ConnectionStatus.PENDING) {
      throw new ApiError(409, "Connection request already sent");
    }
    // If rejected, allow re-sending — update to pending
    existing.status = ConnectionStatus.PENDING;
    existing.requester = requesterId;
    existing.recipient = userId;
    await existing.save();
    return res.status(200).json(
      new ApiResponse(200, existing, "Connection request re-sent")
    );
  }

  const connection = await Connection.create({
    requester: requesterId,
    recipient: userId,
    status: ConnectionStatus.PENDING,
  });

  return res.status(201).json(
    new ApiResponse(201, connection, "Connection request sent")
  );
});

// ---------------------------------------------------------------------------
// PUT /api/v1/users/connections/:connectionId/accept
// ---------------------------------------------------------------------------
export const acceptConnection = asyncHandler(async (req, res) => {
  const { connectionId } = req.params;

  const connection = await Connection.findOne({
    _id: connectionId,
    recipient: req.user._id,                      // Only recipient can accept
    status: ConnectionStatus.PENDING,
  });

  if (!connection) throw new ApiError(404, "Connection request not found");

  connection.status = ConnectionStatus.ACCEPTED;
  await connection.save();

  // Increment connections count on both profiles
  await Profile.findOneAndUpdate({ userId: connection.requester }, { $inc: { connectionsCount: 1 } }, { upsert: true });
  await Profile.findOneAndUpdate({ userId: connection.recipient }, { $inc: { connectionsCount: 1 } }, { upsert: true });

  return res.status(200).json(
    new ApiResponse(200, connection, "Connection accepted")
  );
});

// ---------------------------------------------------------------------------
// PUT /api/v1/users/connections/:connectionId/reject
// ---------------------------------------------------------------------------
export const rejectConnection = asyncHandler(async (req, res) => {
  const { connectionId } = req.params;

  const connection = await Connection.findOne({
    _id: connectionId,
    recipient: req.user._id,
    status: ConnectionStatus.PENDING,
  });

  if (!connection) throw new ApiError(404, "Connection request not found");

  connection.status = ConnectionStatus.REJECTED;
  await connection.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Connection request rejected")
  );
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/users/connections/:connectionId/withdraw  — cancel sent request
// ---------------------------------------------------------------------------
export const withdrawConnection = asyncHandler(async (req, res) => {
  const { connectionId } = req.params;

  const connection = await Connection.findOne({
    _id: connectionId,
    requester: req.user._id,                      // Only requester can withdraw
    status: ConnectionStatus.PENDING,
  });

  if (!connection) throw new ApiError(404, "Pending request not found");

  await Connection.deleteOne({ _id: connectionId });

  return res.status(200).json(
    new ApiResponse(200, {}, "Connection request withdrawn")
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/users/connections/pending  — incoming requests
// ---------------------------------------------------------------------------
export const getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await Connection.find({
    recipient: req.user._id,
    status: ConnectionStatus.PENDING,
  }).populate("requester", "username fullName avatar headline").lean();

  return res.status(200).json(
    new ApiResponse(200, requests, "Pending requests fetched")
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/users/connections  — all accepted connections
// ---------------------------------------------------------------------------
export const getConnections = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [connections, total] = await Promise.all([
    Connection.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: ConnectionStatus.ACCEPTED,
    })
      .populate("requester", "username fullName avatar headline")
      .populate("recipient", "username fullName avatar headline")
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Connection.countDocuments({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: ConnectionStatus.ACCEPTED,
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { connections, total }, "Connections fetched")
  );
});

export const getFollowingStatus = asyncHandler(async (req, res) => {
  const { targetId } = req.params;
  const currentUserId = req.user._id;

  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const isFollowing = targetUser.followers.includes(currentUserId);

  return res.status(200).json({ isFollowing });
});