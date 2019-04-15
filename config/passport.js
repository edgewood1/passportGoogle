const passport = require("passport");

const keys = require("./keys");
const User = require("../models/user-model");
var GoogleStrategy = require("passport-google-oauth20").Strategy;

// grabs an item and stuff into cookie

passport.serializeUser(function(user, done) {
  // null - takes an error
  // user.id - the mongoID > this gets stuffed in a cookie
  done(null, user.id);
});

// returning user has a cookie,
// get id from this cookie
// check to see who the cookie belongs to
passport.deserializeUser(function(user, done) {
  // "user" is the actual id
  User.findById(user).then(user => {
    // "user" is an object with a key of _id

    done(null, user._id);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: "/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      // check if user is in the db
      console.log("lookgin for ... ", profile.id);
      User.findOne({ googleId: profile._id }).then(currentUser => {
        if (currentUser) {
          //already have user
          console.log("user is ", currentUser);
          // done will go to serializer...
          done(null, currentUser);
        } else {
          // create new user
          new User({
            username: profile.displayName,
            googleID: profile.id
          })
            .save()
            .then(newUser => {
              console.log("new User created: " + newUser);
              //   done(profile);
              done(null, newUser);
            });
        }
      });

      //   return done(null, profile);
    }
  )
);

module.exports = passport;
