const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  //   const url = `https://swapi.dev/api/people/${user.charId}`;
  //   const hero = await fetch(url);
  //   console.log(hero);
  res.render("hero/hero", {
    layout: "main",
  });
});

module.exports = router;
