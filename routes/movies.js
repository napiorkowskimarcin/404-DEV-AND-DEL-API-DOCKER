const express = require("express");
const axios = require("axios");
const router = express.Router();
const client = require("../config/redis");
const maxAge = require("../config/maxAge");

//CACHING FOR ROUTE /MOVIES/
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

//GET
//ROUTE /MOVIE/
//GET INFORMATION WHAT MOVIES CAN DOES USER HAS AN ACCESS FOR
router.get("/", cacheHero, async (req, res) => {
  console.log("loaded movies function");
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
    res.send(`Movies that you have access for:
    ${movies}`);
  } catch (error) {
    console.error(error);
  }
});

//AUTHORIZE FOR ROUTE /MOVIES/:ID
//AUTHORIZATION MIDDLEWARE TO CHECK IF USER IS ALLOWED TO SEE A CONTENT
const moviesAuth = async (req, res, next) => {
  const charId = req.charId;
  let tokenHero = await axios.get(`https://swapi.dev/api/people/${charId}/`);
  let tokenMovies = tokenHero.data.films;
  //create an array of films and leave a number of movie to authorize a route
  let tokenMoviesNumbers = tokenMovies.map((item) => item.substr(27));
  tokenMoviesNumbers = tokenMoviesNumbers.map((item) => item.slice(0, -1));
  req.allowedMovies = tokenMoviesNumbers;
  next();
};

//GET
//ROUTE /MOVIES/:ID
//GET SPECIFIC MOVIE - WITH AN ID AS A REQ.PARAMS
router.get("/:id", moviesAuth, async (req, res) => {
  let allowedMovies = req.allowedMovies;
  let authorizationToRoute = allowedMovies.includes(req.params.id);
  if (!authorizationToRoute) {
    res.send(
      `You are not allowed to see this movie. You can only check that ids: ${allowedMovies}`
    );
  }
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
