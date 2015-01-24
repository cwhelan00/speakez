var mongoose = require('mongoose');

//create a User document in mongoDB. Export it to allow other files access
module.exports = mongoose.model('User', {
	username: String,
	password: String,
	email: String
});