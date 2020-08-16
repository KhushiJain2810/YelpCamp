var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
//var seedDB = require("./seeds"); 
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");


//requiring routes files
var campgroundRoutes = require("./routes/campgrounds");
var commentRoutes = require("./routes/comments");
var indexRoutes = require("./routes/index");


mongoose.connect(process.env.DATABASEURL, {useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false,useCreateIndex: true }).then(()=>{
	console.log("Connected to DB!");
}).catch(err=>{
	console.log("ERROR:", err.message);    
});


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"));
app.use(flash());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Once again Rusty wins cutest dog!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//passing to all the templates
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});
app.use("/",  indexRoutes);
app.use("/campgrounds",  campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


//server started
app.listen(process.env.PORT || 3000, function(){
	console.log("Server is listening");
});
