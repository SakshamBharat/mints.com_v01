const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connectoDB");

const Save = sequelize.define("Save", {
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
  tableName: "saved_contents",
  timestamps: true,
});

module.exports = Save;