const jwt = require("jsonwebtoken");

const moviesAuth = (req, res, next) => {
  const charId = req.charId;
  console.log(charId);
};

module.exports = moviesAuth;
