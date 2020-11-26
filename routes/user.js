const express = require("express");
const router = express.Router();
const { model } = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const maxAge = require("../config/maxAge");

//CREATE TOKEN
const createToken = (user) => {
  const payload = { charId: user.charId };
  return jwt.sign(payload, "secret to be hidden", {
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
router.post("/signin", async (req, res) => {
  const { password, email } = req.body;
  let user = await User.findOne({ email: email });
  if (!user) {
    res.send("no user with that name- please create an accout");
  }

  try {
    if (await bcrypt.compare(password, user.password)) {
      const accessToken = await createToken(user);
      console.log({ accessToken });
      console.log(`user: ${user}`);
      res.send({ user, accessToken });
    } else {
      res.send("password incorrect");
    }
  } catch (error) {
    return done(error);
  }
});

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
