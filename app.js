const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const morgan = require("morgan");
const config = require("./config/config");
const bodyParser = require("body-parser");
const path = require("path");

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
app.use(express.static(path.join(__dirname, "public")));

//allow bodyParser to recognize a body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//load handlebars and set .handlebars to .hbs + helpers
const hbs = exphbs.create({
  defaultLayout: "main",
  extname: ".hbs",
});
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

//login request
app.use(morgan("dev"));

//routes
app.use("/user", require("./routes/user"));
app.use("/", require("./routes/index"));

//start listening
app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));
