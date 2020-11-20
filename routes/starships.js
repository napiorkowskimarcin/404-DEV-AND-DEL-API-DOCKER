const express = require("express");
const axios = require("axios");
const router = express.Router();
const client = require("../config/redis");
const expirationTime = 60 * 60 * 24;

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
      client.setex(starshipId, expirationTime, JSON.stringify(starship));
    } else {
      console.log("cached starship!");
      starship = req.starship;
    }

    console.log(starship);
    res.render("hero/starships/starships", {
      layout: "main",
      starship,
    });
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
