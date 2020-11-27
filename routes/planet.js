const express = require("express");
const axios = require("axios");
const router = express.Router();
const client = require("../config/redis");
const maxAge = require("../config/maxAge");

//get the hero information - using req.params to pass the randomised Id and axios to get data from database.

//CACHING FOR A ROUTE /PLANET/
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
/api/planet/:
*    get:
*      summary: "Find planet attached to hero"
*      description: "Returns a list of planet"
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
    planet = await hero.homeworld;

    res.send(`Planet that you have access for:
    ${planet}`);
  } catch (error) {
    console.error(error);
  }
});

//FUNCTION TO USE IN ROUTE /PLANET/:ID
//CHECK IF ID IS AUTHORIZED AND SEND IT
async function getPlanet(req, res) {
  try {
    //CHECK IF USER IS AUTHORIZED TO SEE THIS CONTENT
    let allowedPlanet = req.allowedPlanet;
    let authorizationToRoute = allowedPlanet === req.params.id;
    if (!authorizationToRoute) {
      return res.send(
        `You are not allowed to see this planet. You can only check that ids: ${allowedPlanet}`
      );
    }
    //CHECK IF USER NEED TO FETCH DATA OR IS ABLE TO GET THEM FROM REDIS
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
//CACHING FOR ROUTE /PLANET/:ID
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

//AUTHENTICATION MIDDLEWARE TO CHECK IF USER IS ALLOWED TO SEE A CONTENT
const planetAuth = async (req, res, next) => {
  const charId = req.charId;
  let tokenHero = await axios.get(`https://swapi.dev/api/people/${charId}/`);
  let tokenPlanet = tokenHero.data.homeworld;
  //create a stringwith film and leave a number of planet to authorize a route
  let tokenPlanetNumber = tokenPlanet.substr(29);
  tokenPlanetNumber = tokenPlanetNumber.slice(0, -1);
  req.allowedPlanet = tokenPlanetNumber;
  next();
};

/**
 * @swagger
/api/planet/{Id}:
*    get:
*      summary: "Find planet by ID"
*      description: "Returns a single planet"
*      produces:
*      - "application/xml"
*      - "application/json"
*      parameters:
*      - name: "Id"
*        in: "path"
*        description: "ID of planet to return"
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
router.get("/:id", cache, planetAuth, getPlanet);

module.exports = router;
