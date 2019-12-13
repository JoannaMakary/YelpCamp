var express = require("express");
var app = express();
// middleware for HTTP post requests
var bodyParser = require("body-parser");
// object modeling for node/mongoDB
var mongoose = require("mongoose");
// for error handling
var flash = require("connect-flash");
// Authentication middleware for Node
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");

// modules from other files (schemas)
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");

var seedDB = require("./seeds");

// Requiring routes
var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campgrounds");
var indexRoutes = require("./routes/index");

// connect to local DB
mongoose.connect("mongodb://localhost/yelp_camp_v10", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: true }));
// EJS = Embedded JavaScript instead of HTML
app.set("view engine", "ejs");
// Adding stylesheets
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// Seeding the database
// seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Rusty is the cutest dog",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

// Tell Express to listen for requests (start server)
var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Server has started.");
});