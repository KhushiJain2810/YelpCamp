var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
//When we require a directory, it automatically requires the content of index.js file

//INDEX     
router.get("/", function(req, res){
	//Get all campgrounds from db 
	Campground.find({}, function(err, allcampgrounds){
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("/");
		} else{
			res.render("campgrounds/index", {campgrounds: allcampgrounds});
		}
	});
});

//NEW
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

//:id means anything after campgrounds. So it can be 'new' also. therefore this route should come after 'campgrounds/new'

//CREATE
router.post("/", middleware.isLoggedIn, function(req, res){
	//get data from form and add to campground array
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = {name: name, image: image, description: description, author: author}
	//create a new campground and save to database
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("/campgrouds");
		} else{
			res.redirect("/campgrounds");
		}
	});  //we have two "/campgrounds" but default is GET route
});

//SHOW
router.get("/:id", function(req, res){ 
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("/campgrounds");
		} else{
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

//EDIT ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("/campgrounds");
		}
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

//UPDATE ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("/campgrounds");
		}else{
			req.flash("success", "Successfully updated campground");
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});

//DELETE ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err, deletedCampground){
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("/campgrouds");
		}
		else{
			Comment.deleteMany({_id: { $in: deletedCampground.comments}}, function(err){
				if(err){
					console.log(err);
				} 
				req.flash("success", "Successfully deleted campground");
				res.redirect("/campgrounds");
			});
		}
	});
});

module.exports = router;