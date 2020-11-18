const express = require("express");
const router = express.Router();
const { model } = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const passport = require("passport");

//passport - initialize
const initializePassport = require("../config/passport");
initializePassport(passport);

//load pages - sign in and sign up
router.get("/signin", (req, res) => {
  res.render("users/signin", {
    layout: "main",
  });
});

router.get("/signup", (req, res) => {
  res.render("users/signup", {
    layout: "main",
  });
});

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
    res.redirect("/user/signin");
  } catch (error) {
    console.error(error);
    res.render("users/signup", {
      layout: "main",
    });
  }
});

//log in with existing account
router.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/signin",
    failureFlash: true,
  })
);

module.exports = router;
