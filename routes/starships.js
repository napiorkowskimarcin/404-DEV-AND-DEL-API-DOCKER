const express = require("express");
const axios = require("axios");
const router = express.Router();

//get the starship information - using req.params to pass the randomised Id and axios to get data from database.

router.get("/:id", async (req, res) => {
  try {
    let starship = await axios.get(
      `https://swapi.dev/api/starships/${req.params.id}`
    );
    starship = starship.data;
    console.log(starship);
    res.render("hero/starships/starships", {
      layout: "main",
      starship,
    });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
