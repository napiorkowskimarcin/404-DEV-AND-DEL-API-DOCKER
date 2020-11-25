const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  req.logOut();
  const message = "you are logged out";
  res.send(message);
});

module.exports = router;
