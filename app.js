const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

//import main packages
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const config = require("./config/config");
const bodyParser = require("body-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
//load redis
const client = require("./config/redis");
//set a port
const PORT = process.env.PORT || 3000;

//load mongoose
mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
//set a DB connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to the database");
});

//create check if authenticated
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

const app = express();

//allow bodyParser to recognize a body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//login request
app.use(morgan("dev"));

//routes
app.use("/api/user", require("./routes/user"));
app.use("/api/hero", ensureAuthentication, require("./routes/hero"));
app.use("/api/species", ensureAuthentication, require("./routes/species"));
app.use("/api/movies", ensureAuthentication, require("./routes/movies"));
app.use("/api/starships", ensureAuthentication, require("./routes/starships"));
app.use("/api/planet", ensureAuthentication, require("./routes/planet"));
app.use("/api", require("./routes/index"));

//start listening
app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));
