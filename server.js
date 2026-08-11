const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

require("./models");
require("./models/index");

const router = require("./app");
const deepLinkRoutes = require("./deepLinkRouter");

const { sequelize } = require("./config/connectoDB");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Android App Links
|--------------------------------------------------------------------------
*/

app.use(
    "/.well-known",
    express.static(
        path.join(__dirname, ".well-known"),
        {
            setHeaders: (res) => {
                res.setHeader("Content-Type", "application/json");
            }
        }
    )
);

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

app.use("/api", router);

/*
|--------------------------------------------------------------------------
| Public Reel Share Links
|--------------------------------------------------------------------------
*/

app.use("/", deepLinkRoutes);

/*
|--------------------------------------------------------------------------
| Server
|--------------------------------------------------------------------------
*/

async function Server() {

    try {

        await sequelize.authenticate();

        console.log("Database connected successfully");

        await sequelize.sync({
            alter: true
        });

        console.log("All tables synced");

        app.listen(
            process.env.PORT,
            "0.0.0.0",
            () => {
                console.log(
                    "Server listening on Port",
                    process.env.PORT
                );
            }
        );

    } catch (error) {

        console.error(
            "Unable to connect:",
            error
        );
    }
}

Server();