var login = require('./login');
var register = require('./register');
var User = require('../models/user');

module.exports = function(passport){

	//serialize Users
	//this way sensitive information is not pass around
	passport.serializeUser(function(user, done){
		done(null, user._id);
	});

	//deserialize Users
	//provides a way to access user after http get call
	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user);
		});
	});

	//set up login process
	login(passport);

	//set up registration process
	register(passport);
};