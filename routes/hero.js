const express = require("express");
const axios = require("axios");
const router = express.Router();

//get the hero information - using req.params to pass the randomised Id and axios to get data from database.

router.get("/:id", async (req, res) => {
  try {
    let hero = await axios.get(
      `https://swapi.dev/api/people/${req.params.id}/`
    );
    hero = hero.data;
    //to pass the data for species - sometimes species does not exist, return information about it.
    const species = hero.species;
    if (species[0]) {
      let speciesId = species[0].substr(species.length - 4);
      //to pass the name of the species
      let speciesName = await axios.get(
        `https://swapi.dev/api/species/${speciesId}`
      );
      speciesName = speciesName.data;
      speciesName = speciesName.name;
      //to pass the data for movies
      let movies = hero.films;

      res.render("hero/hero", {
        layout: "main",
        hero,
        speciesId,
        speciesName,
      });
    } else {
      res.render("hero/hero", {
        layout: "main",
        hero,
      });
    }
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
