const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connectoDB");

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  contentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: "comments",
  timestamps: true,
});

module.exports = Comment;