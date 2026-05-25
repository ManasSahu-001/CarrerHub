import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
console.log(process.env.CLOUDINARY_API_KEY);

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
