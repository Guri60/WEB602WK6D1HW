/* ===========================
   EXPRESS SETUP
=========================== */

const express = require("express");
const app = express();

const passportlocal = require('passport-local');

const bodyParser = require("body-parser");

app.use(express.static(__dirname));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const session = require("express-session");

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

const port = process.env.PORT || 3000;


/* ===========================
   PASSPORT SETUP
=========================== */

const passport = require("passport");

app.use(passport.initialize());
app.use(passport.session());


/* ===========================
   MONGOOSE SETUP
=========================== */

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const connectEnsureLogin = require("connect-ensure-login");

mongoose
  .connect("mongodb://127.0.0.1:27017/MyDatabase")
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

const Schema = mongoose.Schema;

const UserDetail = new Schema({
  username: String,
  password: String
});

UserDetail.plugin(passportLocalMongoose);

const UserDetails = mongoose.model(
  "userInfo",
  UserDetail,
  "userInfo"
);


/* ===========================
   PASSPORT LOCAL AUTH
=========================== */

passport.use(UserDetails.createStrategy());

passport.serializeUser(
  UserDetails.serializeUser()
);

passport.deserializeUser(
  UserDetails.deserializeUser()
);


/* ===========================
   ROUTES
=========================== */

// Login POST

app.post("/login", (req, res, next) => {

  passport.authenticate(
    "local",
    (err, user, info) => {

      if (err) {
        return next(err);
      }

      if (!user) {
        return res.redirect("/login?info=Invalid Username or Password");
      }

      req.logIn(user, function (err) {

        if (err) {
          return next(err);
        }

        return res.redirect("/");
      });

    }
  )(req, res, next);

});


// Login page

app.get("/login", (req, res) => {

  res.sendFile("html/login.html", {
    root: __dirname
  });

});


// Home page

app.get(
  "/",
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => {

    res.sendFile("html/index.html", {
      root: __dirname
    });

  }
);


// Private page

app.get(
  "/private",
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => {

    res.sendFile("html/private.html", {
      root: __dirname
    });

  }
);


// User info

app.get(
  "/user",
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => {

    res.send({
      user: req.user
    });

  }
);


// Logout

app.get("/logout", (req, res, next) => {

  req.logout(function (err) {

    if (err) {
      return next(err);
    }

    res.sendFile("html/logout.html", {
      root: __dirname
    });

  });

});


/* ===========================
   START SERVER
=========================== */

app.listen(port, () => {

  console.log(`Server running at http://localhost:${port}`);

});