const express = require("express");
const axios = require("axios");
const router = express.Router();

//get the hero information - using req.params to pass the randomised Id and axios to get data from database.

router.get("/:id", async (req, res) => {
  try {
    let species = await axios.get(
      `https://swapi.dev/api/species/${req.params.id}/`
    );
    species = species.data;
    res.render("hero/species/species", {
      layout: "main",
      species,
    });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
