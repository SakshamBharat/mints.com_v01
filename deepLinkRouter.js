const express = require("express");
const router = express.Router();

const Content = require("../models/contentDb");
const User = require("../models/userDB");


// ============================================================
// OPEN / SHARE REEL
//
// This is NOT an API endpoint.
// This URL is shared publicly:
//
// https://mints-com-v001.onrender.com/reels/123
//
// If the Mints app is installed, Android/iOS should intercept
// the URL and open the app.
//
// If the app is NOT installed, this route provides a web fallback.
// ============================================================

router.get("/reels/:id", async (req, res) => {

    try {

        const contentId = req.params.id;

        const content = await Content.findByPk(
            contentId,
            {
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: [
                            "id",
                            "fullName",
                            "userName"
                        ]
                    }
                ]
            }
        );


        if (!content) {

            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Reel Not Found - Mints</title>
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    >
                </head>

                <body>
                    <h2>Reel not found</h2>
                    <p>This reel may have been deleted.</p>
                </body>

                </html>
            `);

        }


        return res.send(`
            <!DOCTYPE html>
            <html>

            <head>

                <title>
                    ${content.title || "Mints Reel"}
                </title>

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                >

                <meta
                    property="og:title"
                    content="${content.title || "Mints Reel"}"
                >

                <meta
                    property="og:description"
                    content="Watch this reel on Mints"
                >

                ${
                    content.thumbnailUri
                    ? `
                    <meta
                        property="og:image"
                        content="${content.thumbnailUri}"
                    >
                    `
                    : ""
                }

            </head>

            <body>

                <h2>
                    ${content.title || "Mints Reel"}
                </h2>

                <p>
                    Shared from Mints
                </p>

                <p>
                    Open this link in the Mints app to watch the reel.
                </p>

            </body>

            </html>
        `);

    } catch (error) {

        console.error(
            "OPEN SHARED REEL ERROR:",
            error
        );

        return res.status(500).send("Server error");

    }

});


module.exports = router;