var express = require("express");
var app = express();
// middleware for HTTP post requests
var bodyParser = require("body-parser");
// object modeling for node/mongoDB
var mongoose = require("mongoose");
// connect to local DB
mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: true }));

// EJS = Embedded JavaScript instead of HTML
app.set("view engine", "ejs");

// SCHEMA Setup (refactor later)
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

var Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create({
//         name: "Granite Hill",
//         image: "https://www.yosemite.com/wp-content/uploads/2016/04/westlake-campground.png",
//         description: "This is a huge granite hill. No water. Beautiful granite!"
//     },
//     function(err, campground) {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log("NEWLY CREATED CAMPGROUND: ");
//             console.log(campground);
//         }
//     });

// var campgrounds = [
//     { name: "Salmon Creek", image: "http://farm9.staticflickr.com/8605/16573646931_22fc928bf9_o.jpg" },
//     { name: "Granite Hill", image: "https://www.yosemite.com/wp-content/uploads/2016/04/westlake-campground.png" },
//     { name: "Mountain Goat's Rest", image: "https://koa.com/content/campgrounds/kingston/backgrounds/55135backgroundc77c26c1-579c-4d49-a357-331b9153b5bb.jpg?preset=hero-sm" },
//     { name: "Mount Rainier", image: "https://www.nps.gov/mora/planyourvisit/images/OhanaCampground2016_CMeleedy_01_web.jpeg?maxwidth=1200&maxheight=1200&autorotate=false" },
//     { name: "Shenandoah National Park", image: "https://www.nps.gov/shen/planyourvisit/images/20170712_A7A9022_nl_Campsites_BMCG_960.jpg?maxwidth=1200&maxheight=1200&autorotate=false" },
//     { name: "Vancouver Island", image: "http://farm9.staticflickr.com/8605/16573646931_22fc928bf9_o.jpg" },
//     { name: "Wells Gray Park", image: "http://www.clearwatervalley.com/uploads/pics/IMG_1516.JPG" },
//     { name: "Sunnyside Campground", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBKLKUXMBYDL5JHgFu9Z7uvdDhfL6jlN5aF2cLWfsRg141mhu2&s" },
//     { name: "Paradise Valley", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScqoCHZMc9ccakNhtTYZCWruWPge0sMFZc2ZaB1WYZ7DxXS3LrQw&s" }
// ];

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
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
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