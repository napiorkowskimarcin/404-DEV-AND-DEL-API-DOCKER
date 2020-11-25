const express = require("express");
const axios = require("axios");
const router = express.Router();
const client = require("../config/redis");
const expirationTime = 60 * 60 * 24;

//get the hero information - using req.params to pass the randomised Id and axios to get data from database.

async function getPlanet(req, res) {
  try {
    if (!req.planet) {
      // console.log("axios planet");
      let planetId = `Planet${req.params.id}`;
      planet = await axios.get(
        `https://swapi.dev/api/planets/${req.params.id}/`
      );
      planet = planet.data;
      client.setex(planetId, expirationTime, JSON.stringify(planet));
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
