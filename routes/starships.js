const express = require("express");
const axios = require("axios");
const router = express.Router();
const client = require("../config/redis");
const maxAge = require("../config/maxAge");

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
    starships = await hero.starships;

    res.send(`Starships that you have access for:
    ${starships}`);
  } catch (error) {
    console.error(error);
  }
});

//get the starship information - using req.params to pass the randomised Id and axios to get data from database.

async function getStarship(req, res) {
  try {
    if (!req.starship) {
      console.log("axios starship");
      let starshipId = `Starship${req.params.id}`;
      starship = await axios.get(
        `https://swapi.dev/api/starships/${req.params.id}`
      );
      starship = starship.data;
      client.setex(starshipId, maxAge, JSON.stringify(starship));
    } else {
      console.log("cached starship!");
      starship = req.starship;
    }
    res.send(starship);
  } catch (error) {
    console.error(error);
  }
}
function cache(req, res, next) {
  const starshipId = `Starship${req.params.id}`;
  client.get(starshipId, (err, data) => {
    if (err) throw err;
    if (data !== null) {
      req.starship = JSON.parse(data);
      next();
    } else {
      req.starship = null;
      next();
    }
  });
}

router.get("/:id", cache, getStarship);

module.exports = router;
