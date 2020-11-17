const express = require("express");
const mongoose = require("mongoose");
const Handlebars = require("handlebars");
const exphbs = require("express-handlebars");
const morgan = require("morgan");
const config = require("./config/config");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
//flash and session for passport
const flash = require("express-flash");
const session = require("express-session");

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

const app = express();

//allow bodyParser to recognize a body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//load public folder to front-end
app.use(express.static(path.join(__dirname, "public")));

//load and recognize body (own property issue)
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
//load handlebars and set .handlebars to .hbs

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: ".hbs",
  handlebars: allowInsecurePrototypeAccess(Handlebars),
});
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

//login request
app.use(morgan("dev"));

//passport! set resave and saveuninitialized to false. secret should have been placed in seperate file
app.use(flash());
app.use(session({ secret: "asasa", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

//to have acces to account on all of the views.
app.use((req, res, next) => {
  res.locals.login = req.isAuthenticated();
  res.locals.user = req.user;
  res.locals.session = req.session;
  next();
});

//routes
app.use("/user", require("./routes/user"));
app.use("/hero", require("./routes/hero"));
app.use("/", require("./routes/index"));

//start listening
app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));
