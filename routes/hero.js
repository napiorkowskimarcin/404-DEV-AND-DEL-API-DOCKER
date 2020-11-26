const express = require("express");
const axios = require("axios");
const router = express.Router();
const client = require("../config/redis");
const maxAge = require("../config/maxAge");
//get the hero information - using req.params to pass the randomised Id and axios to get data from database.
//get species name and page
//get movies names
//get planets pages

async function getData(req, res) {
  try {
    if (!req.hero) {
      console.log("axios hero");
      let userId = req.params.id;
      hero = await axios.get(`https://swapi.dev/api/people/${userId}/`);
      //KEEP ONLY DATA FROM HERO:
      hero = hero.data;
      //SET HERO TO REDIS
      client.setex(userId, maxAge, JSON.stringify(hero));
    } else {
      console.log("cached hero!");
      hero = req.hero;
    }
    let charId = req.charId;
    res.send({ ...hero, charId });
  } catch (error) {
    console.error(error);
  }
}
//cache middleware
function cache(req, res, next) {
  const userId = req.params.id;
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

router.get("/:id", cache, getData);

module.exports = router;
