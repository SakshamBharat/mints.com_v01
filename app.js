const express = require('express');
const router = express.Router();
const User = require("./models/userDB");
const PendingUser = require("./models/pendingUser");
const Content = require("./models/contentDb");
const Like = require("./models/likeDB");
const Save = require("./models/saveDB");
const Share = require("./models/shareDB");
const Comment = require("./models/commentDB");
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator')
const { log } = require('console');
const sendOTP = require("./config/sendotp");
const jwt = require("jsonwebtoken");
const { or } = require('sequelize');
const { Op } = require('sequelize');
const authMiddleware = require("./middleware/middlewareAuth");
const multer = require('multer');
const upload = require("./config/cloudinary");


const { Sequelize } = require("sequelize");




router.get('/', authMiddleware, (req, res) => {
    res.send('Index');
});
app.get("/test-mail", async (req,res)=>{
    try {
        await transporter.verify();
        res.send("SMTP OK");
    } catch(err){
        res.send(err.message);
    }
});

router.post('/register', async (req, res) => {

    try {

        const salt = await bcrypt.genSalt(10);

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            digits: true,
        });

        const hash_otp = await bcrypt.hash(otp, salt);

        const { fullName, email, userName, password } = req.body;


        const check_UserBYemail = await User.findOne({
            where: { email }
        });

        const check_UserBYUserName = await User.findOne({
            where: { userName }
        });


        if (check_UserBYemail || check_UserBYUserName) {

            return res.status(409).json({
                success: false,
                message: "User already exists"
            });

        }


        const pendingUser = await PendingUser.findOne({
            where: { email }
        });


        if (pendingUser && pendingUser.isVerified === false) {


            await pendingUser.update({
                otp: hash_otp,
                otpExpiresAt: new Date(Date.now() + 1 * 60 * 1000)
            });


            await sendOTP(email, otp);


            return res.status(200).json({
                success: true,
                message: "OTP resent successfully",
                email: pendingUser.email
            });

        }



        const hash_password = await bcrypt.hash(password, salt);


        const new_user = await PendingUser.create({

            fullName,
            email,
            userName,
            password: hash_password,
            otp: hash_otp,
            otpExpiresAt: new Date(Date.now() + 1 * 60 * 1000),
            isVerified: false

        });




        await sendOTP(email, otp);
        return res.status(201).json({
            success: true,
            message: "Registration successful. OTP sent to email",
            email: new_user.email
        });



    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });

    }

});





router.post("/verify_otp", async (req, res) => {

    try {

        const { email, otp } = req.body;


        const pendingUser = await PendingUser.findOne({
            where: { email }
        });


        if (!pendingUser) {

            return res.status(404).json({
                success: false,
                message: "User not found. Please register again"
            });

        }


        if (new Date() > pendingUser.otpExpiresAt) {


            await pendingUser.destroy();


            return res.status(400).json({
                success: false,
                message: "OTP expired. Please request a new OTP"
            });

        }


        const isOTPValid = await bcrypt.compare(
            otp,
            pendingUser.otp
        );


        if (!isOTPValid) {

            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });

        }



        const user = await User.create({

            fullName: pendingUser.fullName,
            email: pendingUser.email,
            userName: pendingUser.userName,
            password: pendingUser.password

        });



        await pendingUser.destroy();



        return res.status(200).json({

            success: true,
            message: "Account verified successfully",

            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                userName: user.userName
            }

        });



    } catch (error) {


        return res.status(500).json({

            success: false,
            message: "Internal server error",
            error: error.message

        });


    }

});

router.post("/resend_otp", async (req, res) => {

    try {

        const { email } = req.body;


        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }


        const pendingUser = await PendingUser.findOne({
            where: { email }
        });



        if (!pendingUser) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }



        const otp = otpGenerator.generate(6, {

            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            digits: true,

        });



        const hash_otp = await bcrypt.hash(otp, 10);



        await pendingUser.update({

            otp: hash_otp,

            otpExpiresAt: new Date(
                Date.now() + 1 * 60 * 1000
            )

        });



        await sendOTP(email, otp);



        return res.status(200).json({

            success: true,

            message: "OTP resent successfully",

            email: pendingUser.email

        });



    } catch (error) {


        console.log(error);


        return res.status(500).json({

            success: false,

            message: "Internal server error",

            error: error.message

        });

    }

});


router.post("/login", async (req, res) => {
    try {
        const { userCredential, password } = req.body;


        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: userCredential },
                    { userName: userCredential }
                ]
            }



        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const jwtToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                userName: user.userName
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7D"
            }
        );
        const clientType = req.headers["x-client-type"];

        if (clientType === "web") {
            res.cookie("token", jwtToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
        }


        res.status(200).json({
            message: "Login successful",
            token: jwtToken,

        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

router.get("/me/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: [
                "id",
                "fullName",
                "email",
                "userName"
            ],
            include: [
                {
                    model: Content,
                    as: "contents",
                    attributes: [
                        "id",
                        "title",
                        "hashtags",
                        "contentUri",
                        "thumbnailUri",
                        "createdAt"
                    ]
                }
            ]
        });

        res.status(200).json({
            user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});



router.post("/upload", authMiddleware, upload.single("reel"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a reel.",
            });
        }

        const { title, hashtags } = req.body;

        const content = await Content.create({
            userId: req.user.id,
            title: title || "Untitled Reel",

            // Frontend se hashtags JSON string me aaye to parse kar lo
            hashtags: hashtags ? JSON.parse(hashtags) : [],

            // Cloudinary URL
            contentUri: req.file.path,

            // Agar thumbnail upload nahi hai to null
            thumbnailUri: null,

            contentType: "video",

            // Bytes
            fileSize: req.file.size,

            // Cloudinary Public ID
            cloudinaryPublicId: req.file.filename,
        });

        return res.status(201).json({
            success: true,
            message: "Reel uploaded successfully.",
            data: content,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
);

router.delete("/content/:id", authMiddleware, async (req, res) => {
    try {

        const contentId = req.params.id;


        // Find content
        const content = await Content.findOne({
            where: {
                id: contentId,
                userId: req.user.id, // only owner can delete
            },
        });


        if (!content) {

            return res.status(404).json({
                success: false,
                message: "Content not found or you don't have permission",
            });

        }



        // Delete from database
        await content.destroy();
        await cloudinary.uploader.destroy(content.cloudinaryPublicId);



        return res.status(200).json({

            success: true,

            message: "Content deleted successfully",

        });



    } catch (error) {

        console.error(error);


        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

}
);




router.get("/reels/feed", authMiddleware, async (req, res) => {
    try {

        const userId = req.user.id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const offset = (page - 1) * limit;


        const { count, rows } = await Content.findAndCountAll({

            include: [
                {
                    model: User,
                    as: "user",
                    attributes: [
                        "id",
                        "fullName",
                        "userName"
                    ]
                },

                {
                    model: Like,
                    attributes: [
                        "userId"
                    ],
                    required: false
                }
            ],


            attributes: {
                exclude: ["cloudinaryPublicId"]
            },


            order: Sequelize.literal("RANDOM()"),

            limit,
            offset
        });


        const reels = rows.map(reel => {

            const likes = reel.Likes || [];


            const liked = likes.some(
                like => like.userId === userId
            );


            return {

                ...reel.toJSON(),

                likes: likes.length,

                liked: liked,

                // remove Like objects from response
                Likes: undefined
            };

        });



        return res.status(200).json({

            success: true,

            pagination: {
                totalReels: count,
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                limit
            },

            data: reels
        });



    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });

    }
});

router.post("/reels/:id/like", authMiddleware, async (req, res) => {
  try {
    const contentId = req.params.id;
    const userId = req.user.id;

    // Check if the user has already liked this reel
    const existingLike = await Like.findOne({
      where: {
        userId,
        contentId,
      },
    });

    // Already liked -> do not allow another like
    if (existingLike) {
      const count = await Like.count({
        where: {
          contentId,
        },
      });

      return res.status(200).json({
        success: true,
        liked: true,
        likes: count,
        message: "You have already liked this reel.",
      });
    }

    // First time like
    await Like.create({
      userId,
      contentId,
    });

    const count = await Like.count({
      where: {
        contentId,
      },
    });

    return res.status(201).json({
      success: true,
      liked: true,
      likes: count,
      message: "Reel liked successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



router.post("/reels/:id/save", authMiddleware, async(req,res)=>{

    try{

        const contentId=req.params.id;
        const userId=req.user.id;


        const saved = await Save.findOne({
            where:{
                userId,
                contentId
            }
        });



        if(saved){

            await saved.destroy();


            return res.status(200).json({
                success:true,
                saved:false
            });

        }



        await Save.create({

            userId,
            contentId

        });



        return res.status(201).json({

            success:true,
            saved:true

        });



    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

});

router.post("/reels/:id/share",authMiddleware,async(req,res)=>{


    try{


        const contentId=req.params.id;


        await Share.create({

            userId:req.user.id,

            contentId

        });



        const count=await Share.count({

            where:{
                contentId
            }

        });



        res.status(201).json({

            success:true,

            shares:count

        });



    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }


});

router.post("/reels/:id/comments",
authMiddleware,
async(req,res)=>{


try{


const contentId=req.params.id;

const {comment}=req.body;


if(!comment){

return res.status(400).json({
message:"Comment required"
});

}



const newComment=await Comment.create({

userId:req.user.id,

contentId,

comment

});



res.status(201).json({

success:true,

data:newComment

});



}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}


});

router.get("/reels/:id/comments",
authMiddleware,
async(req,res)=>{


try{


const comments=await Comment.findAll({

where:{
contentId:req.params.id
},


include:[
{
model:User,
attributes:[
"id",
"userName",
"fullName"
]
}
],


order:[
["createdAt","DESC"]
]


});



res.status(200).json({

success:true,

count:comments.length,

data:comments

});



}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}


});




router.delete("/comments/:id",
authMiddleware,
async(req,res)=>{


try{


const comment=await Comment.findOne({

where:{
id:req.params.id,
userId:req.user.id
}

});



if(!comment){

return res.status(404).json({

message:"Comment not found"

});

}



await comment.destroy();



res.json({

success:true,

message:"Comment deleted"

});



}catch(error){

res.status(500).json({

message:error.message

});

}


});

module.exports = router;

