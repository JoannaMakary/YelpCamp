var express = require("express");
var app = express();
// middleware for HTTP post requests
var bodyParser = require("body-parser");
// object modeling for node/mongoDB
var mongoose = require("mongoose");
// Authentication middleware for Node
var passport = require("passport");
LocalStrategy = require("passport-local");

// modules from other files (schemas)
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");

var seedDB = require("./seeds");

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
    next();
});

// connect to local DB
mongoose.connect("mongodb://localhost/yelp_camp_v6", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: true }));

// EJS = Embedded JavaScript instead of HTML
app.set("view engine", "ejs");
// Adding stylesheets
app.use(express.static(__dirname + "/public"));

// Seeding the database
seedDB();

// GET = Get data
app.get("/", function(req, res) {
    // Send HTML page as response, looks in Views directory for Express
    res.render("landing");
});

// INDEX - show all campgrounds
app.get("/campgrounds", function(req, res) {
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds, currentUser: req.user });
        }
    })
});


// CREATE: add campground to DB
// POST = send data to a server to create/update a resource
app.post("/campgrounds", function(req, res) {
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = { name: name, image: image, description: desc };
    // Create a new campground and save to database
    Campground.create(newCampground, function(err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            // redirect back to campgrounds
            res.redirect("/campgrounds");
        }
    });
})

// NEW: Display form to make new campground
app.get("/campgrounds/new", function(req, res) {
    res.render("campgrounds/new");
});

// SHOW: Shows more info about one campground
app.get("/campgrounds/:id", function(req, res) {
    // find campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundCampground);
            // render show template with that ID
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

// Pattern Match the URL
app.get("/r/:subredditName", function(req, res) {
    var subredditName = req.params.subredditName;
    res.send("You are on " + subredditName);
});

//=====================
// COMMENTS ROUTES
//=====================

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res) {
    // find campground by IDD
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground });
        }
    })
});

app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res) {
    // lookup campground using ID
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

//=====================
// AUTH ROUTES
//=====================

// show register form
app.get("/register", function(req, res) {
    res.render("register");
});

// handle sign-up logic
app.post("/register", function(req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/campgrounds");
        });
    });
});

// show login form
app.get("/login", function(req, res) {
    res.render("login");
});

// handle login logic with middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), function(req, res) {});

// logout logic
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/campgrounds");
});

// middleware to check if user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// Tell Express to listen for requests (start server)
var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Server has started.");
});