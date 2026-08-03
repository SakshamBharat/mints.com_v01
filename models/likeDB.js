const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connectoDB");

const Like = sequelize.define("Like", {
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
}, {
  tableName: "likes",
  timestamps: true,
});

module.exports = Like;