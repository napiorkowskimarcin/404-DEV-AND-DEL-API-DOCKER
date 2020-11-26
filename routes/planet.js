const express = require("express");
const axios = require("axios");
const router = express.Router();
const client = require("../config/redis");
const maxAge = require("../config/maxAge");

//get the hero information - using req.params to pass the randomised Id and axios to get data from database.

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
      client.setex(userId, maxAge, JSON.stringify(hero));
    } else {
      console.log("cached hero!");
      hero = req.hero;
    }
    planet = await hero.homeworld;

    res.send(`Planet that you have access for:
    ${planet}`);
  } catch (error) {
    console.error(error);
  }
});

async function getPlanet(req, res) {
  try {
    if (!req.planet) {
      // console.log("axios planet");
      let planetId = `Planet${req.params.id}`;
      planet = await axios.get(
        `https://swapi.dev/api/planets/${req.params.id}/`
      );
      planet = planet.data;
      client.setex(planetId, maxAge, JSON.stringify(planet));
    } else {
      //console.log("cached planet!");
      planet = req.planet;
    }
    res.send(planet);
  } catch (error) {
    console.error(error);
  }
}

function cache(req, res, next) {
  const planetId = `Planet${req.params.id}`;
  client.get(planetId, (err, data) => {
    if (err) throw err;
    if (data !== null) {
      req.planet = JSON.parse(data);
      next();
    } else {
      req.planet = null;
      next();
    }
  });
}

router.get("/:id", cache, getPlanet);

module.exports = router;
