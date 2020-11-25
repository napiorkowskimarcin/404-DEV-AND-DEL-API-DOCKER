const express = require("express");
const axios = require("axios");
const router = express.Router();
const client = require("../config/redis");
const expirationTime = 60 * 60 * 24;

function cacheHero(req, res, next) {
  const userId = req.user.charId;
  client.get(userId, (err, data) => {
    if (err) throw err;
    if (data !== null) {
      req.hero = JSON.parse(data);
      req.cached = true;
      next();
    } else {
      req.hero = null;
      req.cached = false;
      next();
    }
  });
}
router.get("/", cacheHero, async (req, res) => {
  try {
    if (!req.hero) {
      console.log("axios hero");
      let userId = req.user.charId;
      hero = await axios.get(`https://swapi.dev/api/people/${userId}/`);
      //KEEP ONLY DATA FROM HERO:
      hero = hero.data;

      //SET HERO TO REDIS
      client.setex(userId, expirationTime, JSON.stringify(hero));
    } else {
      console.log("cached hero!");
      hero = req.hero;
    }
    species = await hero.species;

    res.send(`Species that you have access for:
    ${species}`);
  } catch (error) {
    console.error(error);
  }
});

//get species that you have access for
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

    res.send(species);
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
