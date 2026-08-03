const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connectoDB");

const Share = sequelize.define("Share", {
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
  tableName: "shares",
  timestamps: true,
});

module.exports = Share;