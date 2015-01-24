var express = require('express');
var router = express.Router();

/*
/* GET home page. 
router.get('/', function(req, res) {
  res.render('index', {message: req.flash('message')});
});

router.post('/login', passport.authenticate('login', {
	successRedirect: '/',
	failureRedirect: '/',
	failureFlash : true 
}));

module.exports = router;
*/

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('index', { message: req.flash('message') });
	});

	router.get('/login', function(req, res){
		res.render('login', { message: req.flash('message') });
	});

	router.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});

	router.get('/home', isAuthenticated, function(req, res){
		res.render('home', { user: req.user });
	});

	router.get('/room/:room', isAuthenticated, function(req, res){
		res.render('room', { 
			room: req.params.room.replace(/-/g, ' '),
			username: req.user.username
		});
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/login',
		failureFlash : true  
	}));

	router.post('/register', passport.authenticate('register', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true  
	}));

	return router;
}
