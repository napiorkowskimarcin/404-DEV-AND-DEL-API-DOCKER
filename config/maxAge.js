const express = require("express");
//LOAD A EXPIRATION TIME FOR REDIS AND JWT
const maxAge = 60 * 60 * 24;

module.exports = maxAge;
