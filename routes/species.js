const express = require("express");
const axios = require("axios");
const router = express.Router();
const client = require("../config/redis");
const expirationTime = 60 * 60 * 24;

//get the hero information - using req.params to pass the randomised Id and axios to get data from database.

async function getSpecies(req, res) {
  try {
    if (!req.species) {
      console.log("axios species");
      let speciesId = `Species${req.params.id}`;
      species = await axios.get(
        `https://swapi.dev/api/species/${req.params.id}/`
      );
      species = species.data;
      client.setex(speciesId, expirationTime, JSON.stringify(species));
    } else {
      console.log("cached species!");
      species = req.species;
    }

    res.render("hero/species/species", {
      layout: "main",
      species,
    });
  } catch (error) {
    console.error(error);
  }
}

function cache(req, res, next) {
  const speciesId = `Species${req.params.id}`;
  client.get(speciesId, (err, data) => {
    if (err) throw err;
    if (data !== null) {
      req.species = JSON.parse(data);
      next();
    } else {
      req.species = null;
      next();
    }
  });
}

router.get("/:id", cache, getSpecies);

module.exports = router;
