const { authenticate } = require("passport");
const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    const user = await User.findOne({ email: email });
    console.log(user);
    if (!user) {
      return done(null, false, {
        message: "no user with that name- please create an accout",
      });
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "password incorrect" });
      }
    } catch (error) {
      return done(error);
    }
  };
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) =>
    User.findById(id).then((user) => done(null, user))
  );
}

module.exports = initialize;
