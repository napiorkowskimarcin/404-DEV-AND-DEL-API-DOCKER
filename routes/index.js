const express = require("express");
const router = express.Router();

/**
 * @swagger
/api/:
*    get:
*      summary: "Welcome page"
*      description: "Create user or log in please!"
*      responses:
*        "200":
*          description: "successful operation"
*/
router.get("/", (req, res) => {
  const message =
    "Hello. This is an API to get info about a random StarWars hero";
  res.status(200).send(message);
});

module.exports = router;
