const express = require("express");
const axios = require("axios");
const router = express.Router();
const client = require("../config/redis");
const maxAge = require("../config/maxAge");

function cacheHero(req, res, next) {
  const userId = req.charId;
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

/**
 * @swagger
/api/starships/:
*    get:
*      summary: "Find starships attached to hero"
*      description: "Returns a list of starships"
*      produces:
*      - "application/xml"
*      - "application/json"
*      parameters:
*      - name: "Authorization"
*        in: "header"
*        description: "bearer with accessToken to place"
*        required: true
*      responses:
*        "200":
*          description: "successful operation"
*/
router.get("/", cacheHero, async (req, res) => {
  try {
    if (!req.hero) {
      console.log("axios hero");
      let userId = req.charId;
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

//FUNCTION TO USE IN ROUTE /STARSHIPS/:ID
//TO SHOW ALL DATA ABOUT SELECTED STARSHIP
async function getStarship(req, res) {
  let allowedStarships = req.allowedStarships;
  let authorizationToRoute = allowedStarships.includes(req.params.id);
  if (!authorizationToRoute) {
    return res.send(
      `You are not allowed to see this starships. You can only check that ids: ${allowedStarships}`
    );
  }
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

//CACHING FOR ROUTE /SPECIES/:ID
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

//AUTHORIZE FOR ROUTE /STARSHIPS/:ID
//AUTHORIZATION MIDDLEWARE TO CHECK IF USER IS ALLOWED TO SEE A CONTENT
const starshipsAuth = async (req, res, next) => {
  const charId = req.charId;
  let tokenHero = await axios.get(`https://swapi.dev/api/people/${charId}/`);
  let tokenStarships = tokenHero.data.starships;
  //create an array of films and leave a number of starship to authorize a route
  let tokenStarshipsNumbers = tokenStarships.map((item) => item.substr(31));
  tokenStarshipsNumbers = tokenStarshipsNumbers.map((item) =>
    item.slice(0, -1)
  );
  req.allowedStarships = tokenStarshipsNumbers;
  next();
};

/**
 * @swagger
/api/starships/{Id}:
*    get:
*      summary: "Find starship by ID"
*      description: "Returns a single starship"
*      produces:
*      - "application/xml"
*      - "application/json"
*      parameters:
*      - name: "Id"
*        in: "path"
*        description: "ID of starship to return"
*        required: true
*        type: "integer"
*      - name: "Authorization"
*        in: "header"
*        description: "bearer with accessToken to place"
*        required: true
*      responses:
*        "200":
*          description: "successful operation"
*/
router.get("/:id", cache, starshipsAuth, getStarship);

module.exports = router;
