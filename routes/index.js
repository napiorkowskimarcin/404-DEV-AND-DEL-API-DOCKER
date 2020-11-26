const express = require("express");
const router = express.Router();

//GET
//WELCOME PAGE
router.get("/", (req, res) => {
  const message =
    "Hello. This is an API to get info about a random StarWars hero";
  res.send(message);
});

module.exports = router;
