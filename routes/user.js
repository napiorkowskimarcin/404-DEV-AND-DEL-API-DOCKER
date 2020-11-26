const express = require("express");
const router = express.Router();
const { model } = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const maxAge = require("../config/maxAge");

//passport - initialize
const initializePassport = require("../config/passport");
initializePassport(passport);

//CREATE TOKEN
const createToken = (id) => {
  return jwt.sign({ id }, "secret to be hidden", {
    expiresIn: maxAge,
  });
};

//POST
//CREATE AN ACCOUNT
router.post("/signup", async (req, res) => {
  let { email, password } = req.body;

  try {
    password = await bcrypt.hash(password, 10);

    const charId = Math.floor(Math.random() * 84 + 1);

    const user = await new User({ email, password, charId }).save();

    res
      .status(201)
      .send(`saved as: ${user.email} with a randorm Id of${charId}`);
  } catch (error) {
    console.log(error.message, error.code);
    res.status(400).send(error.message);
  }
});

//POST
//LOG IN TO THE APP
router.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/api/",
    failureRedirect: "/api/user/signin/",
    failureFlash: true,
  })
);

//GET
//GET A LIST OF USERS THAT YOU CAN USE
router.get("/", async (req, res) => {
  let user = await User.find();
  user.map((element) => (element.password = "it is a secret!"));
  const message = `please sign in. There is a list of valid users:
  ${user}`;
  res.send(message);
});

module.exports = router;
