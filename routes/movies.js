const express = require("express");
const axios = require("axios");
const router = express.Router();

//get the movie information - using req.params to pass the randomised Id and axios to get data from database.

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
