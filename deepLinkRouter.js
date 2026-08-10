const express = require("express");
const router = express.Router();

const Content = require("./models/contentDb");
const User = require("./models/userDB");

// ============================================================
// PUBLIC SHARED REEL
//
// URL:
// https://mints-com-v001.onrender.com/reels/123
//
// Android App Links:
// If Mints is installed and verified, Android opens the app.
//
// If Mints is not installed, this HTML page is shown.
// ============================================================

router.get("/reels/:id", async (req, res) => {
    try {
        const contentId = req.params.id;

        const content = await Content.findByPk(contentId, {
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
        });

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

        const title = content.title || "Mints Reel";

        return res.send(`
            <!DOCTYPE html>
            <html>

            <head>

                <meta charset="UTF-8">

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                >

                <title>${title} - Mints</title>

                <meta
                    property="og:title"
                    content="${title}"
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

                <h2>${title}</h2>

                <p>Shared from Mints</p>

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
app.get("/.well-known/assetlinks.json", (req, res) => { res.setHeader("Content-Type", "application/json"); res.status(200).send([ { relation: [ "delegate_permission/common.handle_all_urls" ], target: { namespace: "android_app", package_name: "com.sakshambharat.mints.mints", sha256_cert_fingerprints: [ "DE:20:99:78:5A:7B:70:BD:F5:81:7A:E6:9C:23:80:74:42:0E:F4:D6:CA:6E:1A:27:C6:1E:A6:1D:0E:8F:BE:D7" ] } } ]); });

module.exports = router;