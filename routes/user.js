const express = require("express");
const router = express.Router();
const { model } = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const passport = require("passport");

//passport - initialize
const initializePassport = require("../config/passport");
initializePassport(passport);

//create account
router.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const charId = Math.floor(Math.random() * 84 + 1);
    const user = {
      email: req.body.email,
      password: hashedPassword,
      charId: charId,
    };
    new User(user).save();
    res.send(`saved as: ${user.email}`);
  } catch (error) {
    console.error(error);
  }
});

//log in with existing account
router.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/api/",
    failureRedirect: "/api/user/signin/",
    failureFlash: true,
  })
);

//sign in responses
router.get("/", async (req, res) => {
  const user = await User.find();
  const userNames = user.map((element) => element.email);
  const message = `please sign in. There is a list of valid users:
  ${userNames}`;
  res.send(message);
});

module.exports = router;
