import cloudinary from "../config/cloudinary.js";
import fs from "fs";

/**
 * Upload a local file to Cloudinary and remove it from disk.
 * @param {string} localFilePath
 * @param {string} [folder="prolink"]
 * @returns {Promise<object|null>} Cloudinary upload result or null on failure
 */
const uploadOnCloudinary = async (localFilePath, folder = "prolink") => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder,
    });
    fs.unlinkSync(localFilePath); // remove temp file after successful upload
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // clean up even on failure
    console.error("❌ Cloudinary upload failed:", error.message);
    return null;
  }
};

/**
 * Delete a file from Cloudinary by its public_id.
 * @param {string} publicId
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("❌ Cloudinary delete failed:", error.message);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
