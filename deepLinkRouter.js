const express = require("express");
const router = express.Router();

const Content = require("./models/contentDb");
const User = require("./models/userDB");

router.get("/reels/:id", async (req, res) => {

    try {

        const contentId = req.params.id;

        console.log(
            "PUBLIC REEL REQUEST:",
            contentId
        );

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

                    <meta charset="UTF-8">

                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    >

                    <title>Reel Not Found - Mints</title>

                </head>

                <body>

                    <h2>Reel not found</h2>

                    <p>
                        This reel may have been deleted.
                    </p>

                </body>

                </html>
            `);

        }

        const title =
            content.title || "Mints Reel";

        const description =
            "Watch this reel on Mints";

        const thumbnail =
            content.thumbnailUri || "";

        const url =
            `https://mints-com-v001.onrender.com/reels/${content.id}`;

        return res.send(`

            <!DOCTYPE html>

            <html>

            <head>

                <meta charset="UTF-8">

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                >

                <title>
                    ${title} - Mints
                </title>

                <meta
                    name="description"
                    content="${description}"
                >

                <!-- Open Graph -->

                <meta
                    property="og:type"
                    content="video.other"
                >

                <meta
                    property="og:title"
                    content="${title}"
                >

                <meta
                    property="og:description"
                    content="${description}"
                >

                ${
                    thumbnail
                        ? `
                            <meta
                                property="og:image"
                                content="${thumbnail}"
                            >
                        `
                        : ""
                }

                <meta
                    property="og:url"
                    content="${url}"
                >

                <!-- Twitter -->

                <meta
                    name="twitter:card"
                    content="summary_large_image"
                >

                <meta
                    name="twitter:title"
                    content="${title}"
                >

                <meta
                    name="twitter:description"
                    content="${description}"
                >

                ${
                    thumbnail
                        ? `
                            <meta
                                name="twitter:image"
                                content="${thumbnail}"
                            >
                        `
                        : ""
                }

            </head>

            <body>

                <h2>${title}</h2>

                <p>
                    Shared from Mints
                </p>

                <p>
                    Open this link in the Mints app
                    to watch the reel.
                </p>

            </body>

            </html>

        `);

    } catch (error) {

        console.error(
            "OPEN SHARED REEL ERROR:",
            error
        );

        return res.status(500).send(
            "Server error"
        );

    }

});

module.exports = router;