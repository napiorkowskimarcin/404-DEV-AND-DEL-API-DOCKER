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
//get the movie information - using req.params to pass the randomised Id and axios to get data from database.

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
    movies = await hero.films;
    console.log(movies);
    res.send(`Movies that you have access for:
    ${movies}`);
  } catch (error) {
    console.error(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    let movies = await axios.get(
      `https://swapi.dev/api/films/${req.params.id}`
    );
    movies = movies.data;

    res.send(movies);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
