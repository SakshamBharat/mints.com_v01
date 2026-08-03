const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connectoDB");

const Content = sequelize.define(
"Content",
{

id:{
 type:DataTypes.INTEGER,
 autoIncrement:true,
 primaryKey:true
},


userId:{
 type:DataTypes.INTEGER,
 allowNull:false
},


title:{
 type:DataTypes.STRING,
 allowNull:false
},


hashtags:{
 type:DataTypes.JSON,
 allowNull:false,
 defaultValue:[]
},


contentUri:{
 type:DataTypes.STRING,
 allowNull:false
},


thumbnailUri:{
 type:DataTypes.STRING,
 allowNull:true
},


contentType:{
 type:DataTypes.ENUM(
    "video",
    "image",
    "audio"
 ),
 defaultValue:"video"
},


fileSize:{
 type:DataTypes.BIGINT,
 allowNull:true
},


cloudinaryPublicId:{
 type:DataTypes.STRING,
 allowNull:true
}


},
{
tableName:"contents",
timestamps:true
}
);

module.exports = Content;