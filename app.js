const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

//IMPORT MAIN PACKAGES
const router = require("express").Router();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const config = require("./config/config");
const bodyParser = require("body-parser");
const path = require("path");
const jwt = require("jsonwebtoken");

//LOAD SWAGGER
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
//SWAGGER SETUP
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "MN - API FOR DEV AND DELIVER",
      description:
        "Finished homework - as a part of skills check. Check my github: https://github.com/napiorkowskimarcin",
    },
  },
  apis: [
    "./routes/user.js",
    "./routes/index.js",
    "./routes/hero.js",
    "./routes/movies.js",
    "./routes/planet.js",
    "./routes/species.js",
    "./routes/starships.js",
  ],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

//LOAD REDIS
const client = require("./config/redis");

//SET A PORT
const PORT = process.env.PORT || 3000;

//LOAD MONGOOSE
mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
//SET A DB CONNECTION
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to the database");
});

//CREATE CHECK IF AUTHENTICATION
const ensureAuthentication = (req, res, next) => {
  try {
    const authorization = req.get("Authorization");
    const accessToken = authorization.split(" ")[1];
    const payload = jwt.verify(accessToken, "secret to be hidden");
    req.charId = payload.charId;
    next();
  } catch (error) {
    res.send(error);
  }
};

//STARRING AN APP/
const app = express();

//ALLOW BODYPARSER TO RECOGNIZE A BODY
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//LOGGER MIDDLEWARE
app.use(morgan("dev"));

//ROUTES

app.use("/api/user", require("./routes/user"));
app.use("/api/hero", ensureAuthentication, require("./routes/hero"));
app.use("/api/species", ensureAuthentication, require("./routes/species"));
app.use("/api/movies", ensureAuthentication, require("./routes/movies"));
app.use("/api/starships", ensureAuthentication, require("./routes/starships"));
app.use("/api/planet", ensureAuthentication, require("./routes/planet"));
app.use("/api", require("./routes/index"));
//LOAD SWAGGER ROUTE
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//START!
app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));
