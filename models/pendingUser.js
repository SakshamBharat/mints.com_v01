const { Sequelize, DataTypes } = require('sequelize');
const {sequelize} = require("../config/connectoDB")

const PendingUser = sequelize.define(
  'PendingUser',
  {
    // Model attributes are defined here
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
    otp:{
        type: DataTypes.STRING,
        allowNull: false,

    },
    otpExpiresAt: {
  type: DataTypes.DATE,
  allowNull: false,
},
     isVerified:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
       defaultValue: false,

    }
  },
  {
    tableName: "PendingUsers",
    timestamps: true,
  }
);

module.exports = PendingUser;