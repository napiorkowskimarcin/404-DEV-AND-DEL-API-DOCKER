const express = require("express");
const axios = require("axios");
const router = express.Router();
const client = require("../config/redis");
const expirationTime = 60 * 60 * 24;
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
      console.log(hero);
      //SET HERO TO REDIS
      client.setex(userId, expirationTime, JSON.stringify(hero));
    } else {
      console.log("cached hero!");
      hero = req.hero;
      console.log(hero);
    }
    //CREATE ARRAY OF INDEXES OF MOVIES AND DATA TO PASS----------------------------------------------------MOVIES//ready
    //PASSING MOVIES FOR THE HERO.HBS
    let movies = hero.films;

    //step1 - leave numbers only - to pass to it to the page.
    let movieNumArr = movies.map((item) => item.substr(27));

    //step2 - fetch all of the movies from the from the swapi

    let dataMovie = await axios.all(movies.map((item) => axios.get(item)));

    //step 3 - remove all of the information except for necessary the data from the array
    dataMovie = dataMovie.map(({ data, ...rest }) => data);
    dataMovie = dataMovie.map(
      ({
        opening_crawl,
        characters,
        starships,
        planets,
        vehicles,
        species,
        created,
        edited,
        url,
        ...rest
      }) => rest
    );

    //CREATE ARRAY OF INDEXES OF MOVIES AND DATA TO PAS--------------------------------------------------STARSHIPS/ready
    let starships = hero.starships;
    //step1 - leave numbers only - to pass to it to the page.
    const starshipNumArr = starships.map((item) => item.substr(31));

    //step2 - fetch all of the movies from the from the swapi
    let dataStarships = await axios.all(
      starships.map((item) => axios.get(item))
    );
    dataStarships = dataStarships.map(({ data, ...rest }) => data);
    dataStarships = dataStarships.map(
      ({
        edited,
        created,
        films,
        pilots,
        MGLT,
        cargo_capacity,
        consumables,
        ...rest
      }) => rest
    );

    //CREATE VEHICLES DATA TO PASS ----------------------------------------------------------------------------VEHICLES
    //CREATE HOMEWORLD DATA TO PASS----------------------------------------------------------------------------PLANETS/ready
    let homeworld = hero.homeworld;
    // console.log(homeworld);
    //step1 - leave numbers only - to pass to it to the page.

    let planetName = await axios.get(`${hero.homeworld}`);
    planetName = planetName.data;

    //CREATE ARRAY OF SPECIES - WITH ONE ELEMENT ALWAYS (not always exists - cousing problems)-------------SPECIES/ready
    //step1 - leave numbers only - to pass it the page
    const species = hero.species;
    let speciesId = 0;
    let speciesName = 0;
    if (species[0]) {
      speciesId = species[0].substr(29);
      //to pass the name of the species
      speciesName = await axios.get(
        `https://swapi.dev/api/species/${speciesId}`
      );
      speciesName = speciesName.data;
      speciesName = speciesName.name;
    }

    res.render("hero/hero", {
      layout: "main",
      hero,
      speciesId,
      speciesName,
      movieNumArr,
      dataMovie,
      dataStarships,
      planetName,
    });
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
