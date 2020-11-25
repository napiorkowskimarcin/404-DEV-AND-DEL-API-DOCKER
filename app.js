const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const config = require("./config/config");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
//flash and session for passport
const flash = require("express-flash");
const session = require("express-session");
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
  if (req.isAuthenticated()) next();
  else res.send("you need to be logged in 25.11.2020");
};

const app = express();

//allow bodyParser to recognize a body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//login request
app.use(morgan("dev"));

//passport! set resave and saveuninitialized to false. secret should have been placed in seperate file
app.use(flash());
app.use(session({ secret: "asasa", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

//to have acces to user data on all of the views.
app.use((req, res, next) => {
  res.locals.login = req.isAuthenticated();
  res.locals.user = req.user;
  res.locals.session = req.session;
  next();
});

//routes
app.use("/api/user", require("./routes/user"));
app.use("/api/hero", ensureAuthentication, require("./routes/hero"));
app.use("/api/species", ensureAuthentication, require("./routes/species"));
app.use("/api/movies", ensureAuthentication, require("./routes/movies"));
app.use("/api/starships", ensureAuthentication, require("./routes/starships"));
app.use("/api/planet", ensureAuthentication, require("./routes/planet"));
app.use("/api/logout", ensureAuthentication, require("./routes/logout"));
app.use("/api", require("./routes/index"));

//start listening
app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));
