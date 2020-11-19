const express = require("express");
const axios = require("axios");
const router = express.Router();

//get the hero information - using req.params to pass the randomised Id and axios to get data from database.

router.get("/:id", async (req, res) => {
  try {
    let planet = await axios.get(
      `https://swapi.dev/api/planets/${req.params.id}/`
    );
    planet = planet.data;
    res.render("hero/planet/planet", {
      layout: "main",
      planet,
    });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
