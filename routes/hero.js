const express = require("express");
const axios = require("axios");
const router = express.Router();

//get the hero information - using req.params to pass the randomised Id and axios to get data from database.
//get species name and page
//get movies names
//get planets pages

router.get("/:id", async (req, res) => {
  try {
    let hero = await axios.get(
      `https://swapi.dev/api/people/${req.params.id}/`
    );
    //KEEP ONLY DATA FROM HERO:
    hero = hero.data;

    //PASSING MOVIES FOR THE HERO.HBS
    let movies = hero.films;

    //CREATE ARRAY OF INDEXES OF MOVIES
    //step1 - leave numbers only - to pass to it to the page.
    let movieNumArr = movies.map((item) => item.substr(item.length - 2));
    //step2 - fetch all of the movies from the from the swapi
    let dataMovie = await axios.all(movies.map((item) => axios.get(item)));
    //step 3 - remove all of the information except for the data from the array
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
    console.log(dataMovie);

    //to pass the data for species - sometimes species does not exist, return information about it.
    const species = hero.species;
    if (species[0]) {
      let speciesId = species[0].substr(species.length - 4);
      //to pass the name of the species
      let speciesName = await axios.get(
        `https://swapi.dev/api/species/${speciesId}`
      );
      speciesName = speciesName.data;
      speciesName = speciesName.name;
      res.render("hero/hero", {
        layout: "main",
        hero,
        speciesId,
        speciesName,
        movieNumArr,
      });
    } else {
      res.render("hero/hero", {
        layout: "main",
        hero,
      });
    }
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
