const express = require("express");
const app = express();
require("./models"); 
const router = require("./app");
const deepLinkRoutes = require("./deepLinkRouter");
const { sequelize } = require("./config/connectoDB");
const cookieParser = require("cookie-parser");
require("./models/index");
const path = require("path");


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api', router);
app.use("/", deepLinkRoutes);


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
            function(err){

                if(err)
                    console.log(err);

                console.log(
                    "Server listening on Port",
                    process.env.PORT
                );
            }
        );


    } catch(error){

        console.error(
            "Unable to connect:",
            error
        );

    }
}


Server();