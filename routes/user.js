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

/**
 * @swagger
/api/user/signup:
*    post:
*      summary: "Create you own user"
*      description: "You will get a random ID"
*      parameters:
*      - name: "body"
*        in: "body"
*        required: true
*      responses:
*        "201":
*          description: "successful operation"
*/
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

/**
 * @swagger
/api/user/signin:
*    post:
*      summary: "Log with your own user"
*      description: "After being loged in - copy `accessToken`! use it with Authorization, as: `bearer  accessToken`"
*      parameters:
*      - name: "body"
*        in: "body"
*        required: true
*      responses:
*        "200":
*          description: "successful operation"
*/
router.post("/signin", async (req, res) => {
  const { password, email } = req.body;
  let user = await User.findOne({ email: email });
  if (!user) {
    res.status(200).send("no user with that name- please create an accout");
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

/**
 * @swagger
/api/user/:
*    get:
*      summary: "See the list of valid users!"
*      responses:
*        "200":
*          description: "successful operation"
*/
router.get("/", async (req, res) => {
  let user = await User.find();
  user.map((element) => (element.password = "it is a secret!"));
  const message = `please sign in. There is a list of valid users:
  ${user}`;
  res.statu(200).send(message);
});

module.exports = router;
