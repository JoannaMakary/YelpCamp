var express = require("express");
var app = express();
// middleware for HTTP post requests
var bodyParser = require("body-parser");
// object modeling for node/mongoDB
var mongoose = require("mongoose");
// module from models
var Campground = require("./models/campground");
var seedDB = require("./seeds");

// connect to local DB
mongoose.connect("mongodb://localhost/yelp_camp_v3", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: true }));

// EJS = Embedded JavaScript instead of HTML
app.set("view engine", "ejs");

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
            res.render("index", { campgrounds: allCampgrounds });
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
    res.render("new.ejs");
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
            res.render("show", { campground: foundCampground });
        }
    });
});

// Pattern Match the URL
app.get("/r/:subredditName", function(req, res) {
    var subredditName = req.params.subredditName;
    res.send("You are on " + subredditName);
});

// Tell Express to listen for requests (start server)
var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Server has started.");
});