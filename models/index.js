const User = require("./userDB");
const Content = require("./contentDb");
const Like = require("./likeDB");
const Comment = require("./commentDB");
const Save = require("./saveDB");
const Share = require("./shareDB");
const WatchHistory = require("./watchHistoryDB");

// ============================================================
// USER <-> CONTENT
// ============================================================

User.hasMany(Content, {
    foreignKey: "userId",
    as: "contents"
});

Content.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});


// ============================================================
// USER <-> LIKE
// ============================================================

User.hasMany(Like, {
    foreignKey: "userId",
    as: "likes"
});

Like.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});


// ============================================================
// CONTENT <-> LIKE
// ============================================================

Content.hasMany(Like, {
    foreignKey: "contentId",
    as: "likes"
});

Like.belongsTo(Content, {
    foreignKey: "contentId",
    as: "content"
});


// ============================================================
// USER <-> COMMENT
// ============================================================

User.hasMany(Comment, {
    foreignKey: "userId",
    as: "comments"
});

Comment.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});


// ============================================================
// CONTENT <-> COMMENT
// ============================================================

Content.hasMany(Comment, {
    foreignKey: "contentId",
    as: "comments"
});

Comment.belongsTo(Content, {
    foreignKey: "contentId",
    as: "content"
});


// ============================================================
// USER <-> SAVE
// ============================================================

User.hasMany(Save, {
    foreignKey: "userId",
    as: "saves"
});

Save.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});


// ============================================================
// CONTENT <-> SAVE
// ============================================================

Content.hasMany(Save, {
    foreignKey: "contentId",
    as: "saves"
});

Save.belongsTo(Content, {
    foreignKey: "contentId",
    as: "content"
});


// ============================================================
// USER <-> SHARE
// ============================================================

User.hasMany(Share, {
    foreignKey: "userId",
    as: "shares"
});

Share.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});


// ============================================================
// CONTENT <-> SHARE
// ============================================================

Content.hasMany(Share, {
    foreignKey: "contentId",
    as: "shares"
});

Share.belongsTo(Content, {
    foreignKey: "contentId",
    as: "content"
});

// ============================================================
// USER <-> WATCH HISTORY
// ============================================================

User.hasMany(WatchHistory, {
    foreignKey: "userId",
    as: "watchHistory"
});

WatchHistory.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});


// ============================================================
// CONTENT <-> WATCH HISTORY
// ============================================================

Content.hasMany(WatchHistory, {
    foreignKey: "contentId",
    as: "watchHistory"
});

WatchHistory.belongsTo(Content, {
    foreignKey: "contentId",
    as: "content"
});



// ============================================================
// EXPORT
// ============================================================

module.exports = {
    User,
    Content,
    Like,
    Comment,
    Save,
    Share,
    WatchHistory
};