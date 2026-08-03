const User = require("./userDB");
const Content = require("./contentDb");
const Like = require("./likeDB");
const Comment = require("./commentDB");
const Save = require("./saveDB");
const Share = require("./shareDB");

// User <-> Content
User.hasMany(Content, { foreignKey: "userId", as: "contents" });
Content.belongsTo(User, { foreignKey: "userId", as: "user" });

// User <-> Like
User.hasMany(Like, { foreignKey: "userId" });
Like.belongsTo(User, { foreignKey: "userId" });

// Content <-> Like
Content.hasMany(Like, { foreignKey: "contentId" });
Like.belongsTo(Content, { foreignKey: "contentId" });

// User <-> Comment
User.hasMany(Comment, { foreignKey: "userId" });
Comment.belongsTo(User, { foreignKey: "userId" });

// Content <-> Comment
Content.hasMany(Comment, { foreignKey: "contentId" });
Comment.belongsTo(Content, { foreignKey: "contentId" });

// User <-> Save
User.hasMany(Save, { foreignKey: "userId" });
Save.belongsTo(User, { foreignKey: "userId" });

// Content <-> Save
Content.hasMany(Save, { foreignKey: "contentId" });
Save.belongsTo(Content, { foreignKey: "contentId" });

// User <-> Share
User.hasMany(Share, { foreignKey: "userId" });
Share.belongsTo(User, { foreignKey: "userId" });

// Content <-> Share
Content.hasMany(Share, { foreignKey: "contentId" });
Share.belongsTo(Content, { foreignKey: "contentId" });

module.exports = {
  User,
  Content,
  Like,
  Comment,
  Save,
  Share,
};
