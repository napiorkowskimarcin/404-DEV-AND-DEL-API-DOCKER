const express = require("express");
const axios = require("axios");
const router = express.Router();
const client = require("../config/redis");
const maxAge = require("../config/maxAge");
//get the hero information - using req.params to pass the randomised Id and axios to get data from database.

//FUNCTION TO USE IN ROUTE /HERO/:ID
async function getData(req, res) {
  let userId = req.params.id;
  //CHECK IF USER IS AUTHORIZED TO SEE A HERO WITH THAT ID. COMPARE REQ.PARAMS WITH CHAR ID FROM TOKEN
  if (userId != req.charId) {
    return res.send(`You are allowed to see a hero with an Id: ${req.charId}`);
  }
  try {
    if (!req.hero) {
      //console.log("axios hero");

      hero = await axios.get(`https://swapi.dev/api/people/${userId}/`);
      //KEEP ONLY DATA FROM HERO:
      hero = hero.data;
      //SET HERO TO REDIS
      client.setex(userId, maxAge, JSON.stringify(hero));
    } else {
      //console.log("cached hero!");
      hero = req.hero;
    }
    let charId = req.charId;
    res.send({ ...hero, charId });
  } catch (error) {
    console.error(error);
  }
}

//CACHING FOR ROUTE /HERO/:ID
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

/**
 * @swagger
/api/hero/{Id}:
*    get:
*      summary: "Find hero by ID"
*      description: "Returns a single hero"
*      produces:
*      - "application/xml"
*      - "application/json"
*      parameters:
*      - name: "Id"
*        in: "path"
*        description: "ID of hero to return"
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
router.get("/:id", cache, getData);

module.exports = router;
