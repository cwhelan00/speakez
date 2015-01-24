var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	passport.use('login', new LocalStrategy({
		passReqToCallback: true,
		usernameField: 'email'
	},
	function(req, email, password, done){

		//does the username exist
		//log in is done using email
		User.findOne({'email': email}, function(err, user){
			if(err){
				return done(err);
			}

			//if not, propogate back an error
			if(!user){
				return done(null, false, req.flash('message', 'User does not exists'));
			}

			//check if the password is correct
			//if not, propogate back an error
			if(!isValidPassword(user, password)){
				return done(null, false, req.flash('message', 'Invalid password'));
			}
			return done(null, user);
		});

	}));

	var isValidPassword = function(user, password){
		return bCrypt.compareSync(password, user.password);
	};
};