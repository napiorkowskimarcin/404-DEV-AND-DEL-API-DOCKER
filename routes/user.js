const express = require("express");
const router = express.Router();

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

module.exports = router;
