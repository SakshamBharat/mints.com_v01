const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // use your actual sequelize path

const WatchHistory = sequelize.define(
    "WatchHistory",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        contentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        coinEarned: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: "watch_histories",
        timestamps: true,
    }
);

module.exports = WatchHistory;