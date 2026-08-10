const { DataTypes } = require('sequelize');
const {sequelize} = require("../config/connectoDB");

const User = sequelize.define(
  'User',
  {
    // Model attributes are defined here
     id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
}
  },{
    tableName: "User",
    timestamps: true,
  }
  
);

module.exports = User;