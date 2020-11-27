const express = require("express");
const axios = require("axios");
const router = express.Router();
const client = require("../config/redis");
const maxAge = require("../config/maxAge");

//CACHING FOR ROUTE /SPECIES/
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
/api/species/:
*    get:
*      summary: "Find species attached to hero"
*      description: "Returns a list of species"
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
      //console.log("axios hero");
      let userId = req.charId;
      hero = await axios.get(`https://swapi.dev/api/people/${userId}/`);
      //KEEP ONLY DATA FROM HERO:
      hero = hero.data;

      //SET HERO TO REDIS
      client.setex(userId, maxAge, JSON.stringify(hero));
    } else {
      //console.log("cached hero!");
      hero = req.hero;
    }
    species = await hero.species;

    res.send(`Species that you have access for:
    ${species}`);
  } catch (error) {
    console.error(error);
  }
});

//FUNCTION TO USE IN ROUTE /SPECIES/:ID
//TO SHOW ALL DATA ABOUT SELECTED SPECIES
async function getSpecies(req, res) {
  if (!req.allowance) {
    res.send("You have no access to species with that hero");
  }
  try {
    //CHECK IF USER IS AUTHORIZED TO SEE THIS CONTENT
    let allowedSpecies = req.allowedSpecies;
    let authorizationToRoute = allowedSpecies === req.params.id;
    if (!authorizationToRoute) {
      return res.send(
        `You are not allowed to see this planet. You can only check that ids: ${allowedSpecies}`
      );
    }

    if (!req.species) {
      //console.log("axios species");
      let speciesId = `Species${req.params.id}`;
      species = await axios.get(
        `https://swapi.dev/api/species/${req.params.id}/`
      );
      species = species.data;
      client.setex(speciesId, maxAge, JSON.stringify(species));
    } else {
      //console.log("cached species!");
      species = req.species;
    }

    res.send(species);
  } catch (error) {
    console.error(error);
  }
}

//CACHING FOR ROUTE /SPECIES/:ID
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

//AUTHENTICATION MIDDLEWARE TO CHECK IF USER IS ALLOWED TO SEE A CONTENT
const speciesAuth = async (req, res, next) => {
  const charId = req.charId;
  let tokenHero = await axios.get(`https://swapi.dev/api/people/${charId}/`);
  let tokenSpecies = tokenHero.data.species;
  let allowance = true;
  if (!tokenSpecies.length) {
    allowance = false;
  } else {
    //create a stringwith film and leave a number of planet to authorize a route
    let tokenSpeciesNumber = tokenSpecies[0].substr(29);
    tokenSpeciesNumber = tokenSpeciesNumber.slice(0, -1);
    req.allowedSpecies = tokenSpeciesNumber;
  }
  req.allowance = allowance;
  console.log(allowance);
  next();
};

/**
 * @swagger
/api/species/{Id}:
*    get:
*      summary: "Find species by ID"
*      description: "Returns a single species"
*      produces:
*      - "application/xml"
*      - "application/json"
*      parameters:
*      - name: "Id"
*        in: "path"
*        description: "ID of species to return"
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
router.get("/:id", cache, speciesAuth, getSpecies);

module.exports = router;
