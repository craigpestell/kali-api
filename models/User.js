var keystone = require('keystone');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var secret = require('../config').secret;

var Types = keystone.Field.Types;

/*

User.schema.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });

*/

/**
 * User Model
 * ==========
 */

var User = new keystone.List('User');

User.add(
	{
		name: { type: Types.Name, required: true, index: true },
		email: { type: Types.Email, initial: true, required: true, index: true },

	},
	'Permissions',
	{
		isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },

		hash: { type: String },
		salt: { type: String },
	},
	{ posts: { type: Types.Relationship, ref: 'Post', path: 'posts', refPath: 'author' } }
);

User.schema.plugin(uniqueValidator, { message: 'is already taken.' });

User.schema.methods.validPassword = function (password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
	return this.hash === hash;
};

User.schema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

User.schema.methods.generateJWT = function () {
	var today = new Date();
	var exp = new Date(today);
	exp.setDate(today.getDate() + 60);

	return jwt.sign(
		{
			id: this._id,
			username: this.username,
			exp: parseInt(exp.getTime() / 1000),
		},
		secret
	);
};

User.schema.methods.toAuthJSON = function () {
	return {
		username: this.username,
		email: this.email,
		token: this.generateJWT(),
		bio: this.bio,
		image: this.image,
	};
};

User.schema.methods.toProfileJSONFor = function (user) {
	return {
		username: this.username,
		bio: this.bio,
		image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
		following: user ? user.isFollowing(this._id) : false,
	};
};

User.schema.methods.favorite = function (id) {
	if (this.favorites.indexOf(id) === -1) {
		this.favorites.push(id);
	}

	return this.save();
};

User.schema.methods.unfavorite = function (id) {
	this.favorites.remove(id);
	return this.save();
};

User.schema.methods.isFavorite = function (id) {
	return this.favorites.some(function (favoriteId) {
		return favoriteId.toString() === id.toString();
	});
};

User.schema.methods.follow = function (id) {
	if (this.following.indexOf(id) === -1) {
		this.following.push(id);
	}

	return this.save();
};

User.schema.methods.unfollow = function (id) {
	this.following.remove(id);
	return this.save();
};

User.schema.methods.isFollowing = function (id) {
	return this.following.some(function (followId) {
		return followId.toString() === id.toString();
	});
};

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

/**
 * Registration
 */

User.defaultColumns = 'name, email, isAdmin';
User.register();
