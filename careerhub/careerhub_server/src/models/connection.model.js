import mongoose, { Schema } from "mongoose";
import { ConnectionStatus } from "../utils/constants.js";

/**
 * Connection — LinkedIn-style "connect" system
 *
 * WHY a separate model (not array on User)?
 * Arrays on User docs grow unbounded → slow reads for popular users.
 * A separate collection lets us query efficiently with indexes.
 *
 * States: pending → accepted | rejected
 */
const connectionSchema = new Schema(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ConnectionStatus),
      default: ConnectionStatus.PENDING,
    },
  },
  { timestamps: true }
);

// Prevent duplicate connection requests between the same two users
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
// Fast lookups: "all pending requests for user X"
connectionSchema.index({ recipient: 1, status: 1 });
// Fast lookups: "all requests sent by user X"
connectionSchema.index({ requester: 1, status: 1 });

export default mongoose.model("Connection", connectionSchema);
