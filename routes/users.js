var express = require("express");
var router = express.Router();
var mongojs = require("mongojs");
var db = mongojs("passportapp",["users"]);
var bcrypt = require("bcryptjs");
var passport = require("passport");
var LocalStrategy = require("passport-local");
//Login Page -GET
router.get("/login",function(req,res){
	res.render("login");
});
//Register Page - GET
router.get("/register",function(req,res){
	res.render("register");
});
//Register Page - POST
router.post("/register",function(req,res){
	//Get Form Values
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	// Validator
	req.checkBody("name","Name field is require").notEmpty();
	req.checkBody("email","Email field is require").notEmpty();
	req.checkBody("email","Please use a valid email address").isEmail();
	req.checkBody("username","Username field is require").notEmpty();
	req.checkBody("password","Password field is require").notEmpty();
	req.checkBody("password2","Password do not match").equals(req.body.password);
	var errors = req.validationErrors();
	if(errors){
		console.log("form has errors")
		res.render("register",{
			errors : errors,
			name : name,
			email : email,
			username : username,
			password : password,
			password2 : password2
		});
	} else {
		var newUser = {name : name,
			email : email,
			username : username,
			password : password
		};
		bcrypt.genSalt(10,function(err,salt){
			bcrypt.hash(newUser.password,salt,function(err,hash){
				newUser.password= hash;
				db.users.insert(newUser,function(err,user){
					if(err){
						res.send(err);
					} else {
						console.log("Users add...");
						//Success message
						req.flash("success","You are register and can now log in");
						res.location("/");
						res.redirect("/");
					}
				})
			})
		})
	}
});
//Passport
passport.serializeUser(function(user,done){
	done(null,user._id);
});
passport.deserializeUser(function(id,done){
	db.users.findOne({_id: mongojs.ObjectId(id)},function(err,user){
		done(err,user);
	})
})
//Locals strategy
passport.use(new LocalStrategy(function(username,password,done){
	db.users.findOne({username: username},function(err,user){
		if(err){
			return done(err);
		}
		if(!user){
			return done(null,false,{message:"Incorrect Username"});
		}
		bcrypt.compare(password,user.password,function(err,isMatch){
			if(err){
				return done(err);
			}
			if(isMatch){
				return done(null,user);
			}else{
				return done(null,false,{message:"Incorrect Password"});
			}
		})
	})
}))
//Login Page -POST
router.post("/login",passport.authenticate("local",{
	successRedirect: "/",
	failureRedirect: "/users/login",
	failureFlash: "Invalid Username Or Password"
})
	,function(req,res){
	consle.log("Auth successfull");
	res.redirect("/");
});
router.get("/logout",function(req,res){
	req.logout();
	res.redirect("/users/login");
})

module.exports = router;