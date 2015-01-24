var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	passport.use('register', new LocalStrategy({
		passReqToCallback: true
	},
	function(req, username, password, done){

		//does the username exist
		User.findOne({'username': username}, function(err, user){
			if(err){
				return done(err);
			}

			//if so, propogate back an error
			if(user){
				return done(null, false, req.flash('message', 'User exists'));
			}
			var newUser = new User();

			newUser.username = username;
			newUser.password = createHash(password);
			newUser.email = req.body.email;

			if(req.body.email.indexOf('@') < 0){
				return done(null, false, req.flash('message', 'Invalid Email'));
			}

			newUser.save(function(){
				if(err){
					console.log(err);
				}
				return done(null, newUser);
			});

		});
	}));

	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};
};