var express = require("express");
var path = require("path");
var passport = require("passport");
const passportSetup = require("./config/passport");
const mongoose = require("mongoose");
const keys = require("./config/keys");
//  this stores session data in a cookie within the browser whereas express-session stores a session-id within a cookie in the browser while storing session data on the server.  use cookie session in apps where no database is used in backend if session data is smaller than cookie size.
// A user session can be stored in two main ways with cookies: on the server or on the client. This module stores the session data on the client within a cookie, while a module like express-session stores only a session identifier on the client within a cookie and stores the session data on the server, typically in a database.

const cookieSession = require("cookie-session");

mongoose.connect(keys.mongodb.dbURI, () => {
  console.log("connected to mongodb");
});

var app = express();

app.use(express.static(path.join(__dirname, "public")));
// app.use(require("cookie-parser")());
// app.use(require("body-parser").urlencoded({ extended: true }));
// app.use(
//   require("express-session")({
//     secret: "keyboard cat",
//     resave: true,
//     saveUninitialized: true
//   })
// );

// this encrypts cookie and sends it to the browser
app.use(
  cookieSession({
    // 1 hr...
    maxAge: 60 * 1000,
    keys: [keys.session.cookieKey]
  })
);
app.use(passport.initialize());
app.use(passport.session());

/// pasport

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.redirect("/logged");
});

app.get("/logout", (req, res) => {
  console.log("you're logged out");
  req.logout();
  res.redirect("/");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { successRedirect: "/", scope: ["profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log("you're logged in");
    res.redirect("/logged");
  }
);

// but what is req.user below???????

const authCheck = (req, res, next) => {
  if (!req.user) {
    // if user not logged in
    console.log("you're logged out");
    res.redirect("/");
  } else {
    console.log("you're logged in");
    next();
  }
};

// this is the "inner page" - in order to access it, you need to pass the "authCheck" above

app.get("/logged", authCheck, (req, res) => {
  console.log("you're logged in");
  res.sendFile(path.join(__dirname, "public", "logged.html"));
});

app.listen(3001, function() {
  console.log("App listening on PORT " + 3001);
});
