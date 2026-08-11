const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const crypto = require("crypto");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sanitize = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    const userId = req.user.id;
    const username = sanitize(req.user.userName);

    // Unique professional identifier
    const uniqueId = crypto.randomBytes(6).toString("hex");

    // Example:
    // reel-665f2a8c-john-doe-20260811-232455-a81f29
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);

    return {
      folder: `sakshambharat/mints.com/users/${userId}-${username}/reels`,

      public_id: `reel-${userId}-${username}-${timestamp}-${uniqueId}`,

      resource_type: "video",
      format: "mp4",

      // Optional but useful
      type: "upload",
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"), false);
    }
  },
});

module.exports = upload;