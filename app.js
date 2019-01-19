var express = require("express");
var path = require("path");
var passport = require("passport");
var flash = require("connect-flash");
var LocalStrategy = require("passport-local");
var ejs = require("ejs");
var bodyParser = require("body-parser");
var expressValidator = require("express-validator");
var session = require("express-session");

var routes = require("./routes/index");
var users = require("./routes/users");
var app = express();

//view engine
app.set("views", path.join(__dirname,"views"));
app.set("view engine","ejs");

//Set static folder
app.use(express.static(path.join(__dirname,"public")));
app.use("/css",express.static(path.join(__dirname,"/node_modules/bootstrap/dist/css")));
 //BodyParser
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({extended : false}));
 //Express session middleware
 app.use(session({
 	secret: "secret",
 	saveUninitialized: true,
 	resave: true 
 }));
 //passport Middleware
app.use(passport.initialize());
app.use(passport.session());
//Express validator 
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;
    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
// Connect flash midlleware
app.use(flash());
app.use(function(req,res,next){
	res.locals.messages = require("express-messages")(req,res);
	next();
});
//global variable
app.get("*",function(req,res,next){
  res.locals.user = req.user || null;
  next();
})
//Define Routes
app.use("/",routes);
app.use("/users",users);
app.listen(3000);
console.log("Server run on port 3000...");
module.exports = app;