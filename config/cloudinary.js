const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: "ddbp0hpb0",
  api_key: "181766198769122",
  api_secret: "XynB_TQ5nJkbVRxy2Uph2-wAiu0",
});




const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `sakshambharat/mints.com/users/${req.user.id}-${req.user.userName
      .toLowerCase()
      .replace(/\s+/g, "-")}`,
    public_id: `reel-${Date.now()}`,
    resource_type: "video",
    format: "mp4",
  })
});

const upload = multer({ storage });

module.exports = upload;
