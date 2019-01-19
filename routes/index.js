var express = require("express");
var router = express.Router();
router.get("/",isLoggin, function(req,res){
	res.render("home");
});
function isLoggin(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/users/login");
}
module.exports = router;