const express = require('express');
const router = express.Router();
require("./models/index");







const User = require("./models/userDB");
const PendingUser = require("./models/pendingUser");
const Content = require("./models/contentDb");
const Like = require("./models/likeDB");
const Save = require("./models/saveDB");
const Share = require("./models/shareDB");
const Comment = require("./models/commentDB");
const WatchHistory = require("./models/watchHistoryDB");






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

                // ====================================================
                // USER
                // ====================================================

                {
                    model: User,
                    as: "user",
                    attributes: [
                        "id",
                        "fullName",
                        "userName"
                    ]
                },

                // ====================================================
                // LIKES
                // ====================================================

                {
                    model: Like,
                    as: "likes",
                    attributes: [
                        "userId"
                    ],
                    required: false
                },

                // ====================================================
                // COMMENTS
                // ====================================================

                {
                    model: Comment,
                    as: "comments",
                    attributes: [
                        "id"
                    ],
                    required: false
                }
            ],

            attributes: {
                exclude: [
                    "cloudinaryPublicId"
                ]
            },

            order: Sequelize.literal("RANDOM()"),

            limit,
            offset,

            distinct: true
        });

        const reels = rows.map(reel => {

            const reelJson = reel.toJSON();

            const likeList = reelJson.likes || [];
            const commentList = reelJson.comments || [];

            const liked = likeList.some(
                like => like.userId === userId
            );

            delete reelJson.likes;
            delete reelJson.comments;

            return {
                ...reelJson,

                likes: likeList.length,

                liked: liked,

                comments: commentList.length
            };
        });


        return res.status(200).json({
            success: true,

            pagination: {
                totalReels: count,
                currentPage: page,
                totalPages: Math.ceil(
                    count / limit
                ),
                limit
            },

            data: reels
        });

    } catch (error) {

        console.error(
            "GET REELS FEED ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});



 

router.post(
    "/reels/:id/like",
    authMiddleware,
    async (req, res) => {

        try {

            const contentId = req.params.id;
            const userId = req.user.id;

            // ==================================================
            // CHECK EXISTING LIKE
            // ==================================================

            const existingLike = await Like.findOne({
                where: {
                    userId,
                    contentId,
                },
            });

            // ==================================================
            // UNLIKE
            // ==================================================

            if (existingLike) {

                await existingLike.destroy();

                const count = await Like.count({
                    where: {
                        contentId,
                    },
                });

                return res.status(200).json({

                    success: true,

                    liked: false,

                    likes: count,

                    message: "Reel unliked successfully",

                });

            }

            // ==================================================
            // LIKE
            // ==================================================

            await Like.create({
                userId,
                contentId,
            });

            const count = await Like.count({
                where: {
                    contentId,
                },
            });

            return res.status(200).json({

                success: true,

                liked: true,

                likes: count,

                message: "Reel liked successfully",

            });

        } catch (error) {

            console.error(
                "LIKE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: error.message,
            });

        }

    }
);


router.post("/reels/:id/save", authMiddleware, async (req, res) => {
    try {
        const contentId = req.params.id;
        const userId = req.user.id;

        const saved = await Save.findOne({
            where: {
                userId,
                contentId,
            },
        });

        if (saved) {
            await saved.destroy();

            return res.status(200).json({
                success: true,
                saved: false,
            });
        }

        await Save.create({
            userId,
            contentId,
        });

        return res.status(200).json({
            success: true,
            saved: true,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});



router.post("/reels/:id/share", authMiddleware, async (req, res) => {


    try {


        const contentId = req.params.id;


        await Share.create({

            userId: req.user.id,

            contentId

        });



        const count = await Share.count({

            where: {
                contentId
            }

        });



        res.status(201).json({

            success: true,

            shares: count

        });



    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }


});




// GET COMMENTS
// ============================================================

router.get("/reels/:id/comments", authMiddleware, async (req, res) => {
    try {

        const contentId = req.params.id;

        const content = await Content.findByPk(contentId);

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Reel not found"
            });
        }

        const comments = await Comment.findAll({

            where: {
                contentId: contentId
            },

            include: [
                {
                    model: User,
                    as: "user",
                    attributes: [
                        "id",
                        "userName",
                        "fullName"
                    ]
                }
            ],

            order: [
                ["createdAt", "DESC"]
            ]
        });

        return res.status(200).json({
            success: true,
            data: comments
        });

    } catch (error) {

        console.error(
            "GET COMMENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// CREATE COMMENT
// ============================================================

router.post("/reels/:id/comments", authMiddleware, async (req, res) => {
    try {

        const contentId = req.params.id;
        const userId = req.user.id;

        const { comment } = req.body;

        if (!comment || !comment.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment required"
            });
        }

        if (comment.trim().length > 500) {
            return res.status(400).json({
                success: false,
                message: "Comment cannot exceed 500 characters"
            });
        }

        const content = await Content.findByPk(contentId);

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Reel not found"
            });
        }

        const newComment = await Comment.create({
            userId: userId,
            contentId: contentId,
            comment: comment.trim()
        });

        const commentWithUser = await Comment.findOne({

            where: {
                id: newComment.id
            },

            include: [
                {
                    model: User,
                    as: "user",
                    attributes: [
                        "id",
                        "userName",
                        "fullName"
                    ]
                }
            ]
        });

        return res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: commentWithUser
        });

    } catch (error) {

        console.error(
            "ADD COMMENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});


// DELETE OWN COMMENT
// ============================================================

router.delete("/comments/:id", authMiddleware, async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;

        const comment = await Comment.findOne({
            where: {
                id: commentId,
                userId: userId
            }
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found or you don't have permission"
            });
        }

        await comment.destroy();

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });

    } catch (error) {
        console.error("DELETE COMMENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});









// ============================================================
// SAVE WATCH HISTORY
// Does NOT give a coin.
// History is saved as soon as user watches 1%.
// ============================================================

router.post(
    "/watch-history/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const contentId = req.params.id;
            const userId = req.user.id;

            // ==================================================
            // CHECK REEL
            // ==================================================

            const content = await Content.findByPk(contentId);

            if (!content) {

                return res.status(404).json({
                    success: false,
                    message: "Reel not found",
                });

            }

            // ==================================================
            // CHECK EXISTING HISTORY
            // ==================================================

            let history = await WatchHistory.findOne({
                where: {
                    userId,
                    contentId,
                },
            });

            // ==================================================
            // ALREADY EXISTS
            // ==================================================

            if (history) {

                return res.status(200).json({
                    success: true,
                    alreadyExists: true,
                    coinEarned: history.coinEarned === true,
                    data: history,
                    message: "Reel already exists in watch history",
                });

            }

            // ==================================================
            // CREATE HISTORY
            // ==================================================

            history = await WatchHistory.create({
                userId,
                contentId,
                coinEarned: false,
            });

            return res.status(201).json({
                success: true,
                alreadyExists: false,
                coinEarned: false,
                data: history,
                message: "Reel added to watch history",
            });

        } catch (error) {

            console.error(
                "SAVE WATCH HISTORY ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            });

        }

    }
);


// ============================================================
// CLAIM WATCH COIN
//
// Called only after 80% of reel has been watched.
//
// One user + one reel = maximum 1 coin.
// ============================================================

router.post(
    "/watch-history/:id/coin",
    authMiddleware,
    async (req, res) => {

        const transaction =
            await WatchHistory.sequelize.transaction();

        try {

            const contentId = req.params.id;
            const userId = req.user.id;

            // ==================================================
            // CHECK REEL
            // ==================================================

            const content = await Content.findByPk(
                contentId,
                {
                    transaction,
                }
            );

            if (!content) {

                await transaction.rollback();

                return res.status(404).json({
                    success: false,
                    message: "Reel not found",
                });

            }

            // ==================================================
            // FIND HISTORY
            // ==================================================

            let history = await WatchHistory.findOne({
                where: {
                    userId,
                    contentId,
                },
                transaction,

                // Prevent two simultaneous coin requests.
                lock: transaction.LOCK.UPDATE,
            });

            // ==================================================
            // IF HISTORY DOES NOT EXIST
            //
            // This can happen if the 1% request failed but
            // the 80% request succeeded.
            //
            // Create it here safely.
            // ==================================================

            if (!history) {

                history = await WatchHistory.create(
                    {
                        userId,
                        contentId,
                        coinEarned: false,
                    },
                    {
                        transaction,
                    }
                );

            }

            // ==================================================
            // ALREADY CLAIMED
            // ==================================================

            if (history.coinEarned === true) {

                const user = await User.findByPk(
                    userId,
                    {
                        attributes: [
                            "id",
                            "coins",
                        ],
                        transaction,
                    }
                );

                await transaction.commit();

                return res.status(200).json({
                    success: true,
                    alreadyClaimed: true,
                    coinEarned: 0,
                    totalCoins: user ? user.coins : 0,
                    message: "Coin already earned for this reel",
                });

            }

            // ==================================================
            // MARK COIN EARNED
            // ==================================================

            await history.update(
                {
                    coinEarned: true,
                },
                {
                    transaction,
                }
            );

            // ==================================================
            // ADD ONE COIN
            // ==================================================

            await User.increment(
                "coins",
                {
                    by: 1,

                    where: {
                        id: userId,
                    },

                    transaction,
                }
            );

            // ==================================================
            // GET NEW BALANCE
            // ==================================================

            const user = await User.findByPk(
                userId,
                {
                    attributes: [
                        "id",
                        "coins",
                    ],
                    transaction,
                }
            );

            await transaction.commit();

            return res.status(200).json({
                success: true,
                alreadyClaimed: false,
                coinEarned: 1,
                totalCoins: user ? user.coins : 0,
                message: "1 coin earned!",
            });

        } catch (error) {

            try {
                await transaction.rollback();
            } catch (_) {}

            console.error(
                "CLAIM WATCH COIN ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            });

        }

    }
);


// ============================================================
// GET WATCH HISTORY
// ============================================================

router.get(
    "/watch-history",
    authMiddleware,
    async (req, res) => {

        try {

            const userId = req.user.id;

            // ==================================================
            // HISTORY
            // ==================================================

            const history =
                await WatchHistory.findAll({

                    where: {
                        userId,
                    },

                    include: [
                        {
                            model: Content,
                            as: "content",

                            attributes: [
                                "id",
                                "title",
                                "hashtags",
                                "contentUri",
                                "thumbnailUri",
                                "contentType",
                                "createdAt",
                            ],

                            include: [
                                {
                                    model: User,
                                    as: "user",

                                    attributes: [
                                        "id",
                                        "fullName",
                                        "userName",
                                    ],
                                },
                            ],
                        },
                    ],

                    order: [
                        ["createdAt", "DESC"],
                    ],
                });


            // ==================================================
            // REAL COIN BALANCE
            // ==================================================

            const user = await User.findByPk(
                userId,
                {
                    attributes: [
                        "id",
                        "coins",
                    ],
                }
            );


            return res.status(200).json({

                success: true,

                totalCoins: user
                    ? Number(user.coins || 0)
                    : 0,

                data: history,

            });

        } catch (error) {

            console.error(
                "GET WATCH HISTORY ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            });

        }

    }
);



module.exports = router;

