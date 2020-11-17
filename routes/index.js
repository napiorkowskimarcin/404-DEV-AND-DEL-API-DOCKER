const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", {
    layout: "main",
  });
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

module.exports = router;
