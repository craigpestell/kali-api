var mongoose = require('mongoose');

// var router = require('express').Router();
var passport = require('passport');
// var User = mongoose.model('User');

var keystone = require('keystone');

var User = mongoose.model('User');

/**
 * List Users
 */
exports.list = function (req, res) {
	User.find(function (err, items) {
		if (err) return res.json({ err: err });

		res.json({
			users: items,
		});
	});
};

exports.get = function (req, res) {
	console.log('user payload:', req.payload);
	User.findById(req.payload.id).exec(function (err, user) {
		if (!user) {
			return res.sendStatus(401);
		}

		return res.json({ user: user.toAuthJSON() });
	});
};

/**
 * Create a People
 */
exports.create = function (req, res, next) {
	var user = new User();

	user.username = req.body.user.username;
	user.email = req.body.user.email;
	user.setPassword(req.body.user.password);

	user
		.save()
		.then(function () {
			return res.json({ user: user.toAuthJSON() });
		})
		.catch(next);
};

/**
 * Patch People by ID
 */
exports.update = function (req, res) {
	User.findById(req.params.id).exec(function (err, item) {
		if (err) return res.json({ err: err });
		if (!item) return res.json({ err: 'not found' });

		var data = req.method == 'PUT' ? req.body : req.query;

		item.getUpdateHandler(req).process(data, function (err) {
			if (err) return res.json({ err: err });

			res.json(item);
		});
	});
};

/**
 * Delete People by ID
 */
exports.remove = function (req, res) {
	User.model.findById(req.params.id).exec(function (err, item) {
		if (err) return res.json({ dberror: err });
		if (!item) return res.json('not found');

		item.remove(function (err) {
			if (err) return res.json({ dberror: err });

			return res.json({
				success: true,
			});
		});
	});
};

exports.put = function (req, res, next) {
	User.model
		.findById(req.payload.id)
		.then(function (user) {
			if (!user) {
				return res.sendStatus(401);
			}

			// only update fields that were actually passed...
			if (typeof req.body.user.username !== 'undefined') {
				user.username = req.body.user.username;
			}
			if (typeof req.body.user.email !== 'undefined') {
				user.email = req.body.user.email;
			}
			if (typeof req.body.user.bio !== 'undefined') {
				user.bio = req.body.user.bio;
			}
			if (typeof req.body.user.image !== 'undefined') {
				user.image = req.body.user.image;
			}
			if (typeof req.body.user.password !== 'undefined') {
				user.setPassword(req.body.user.password);
			}

			return user.save().then(function () {
				return res.json({ user: user.toAuthJSON() });
			});
		})
		.catch(next);
};

/* router.get('/user', auth.required, function (req, res, next) {
	User.findById(req.payload.id)
		.then(function (user) {
			if (!user) {
				return res.sendStatus(401);
			}

			return res.json({ user: user.toAuthJSON() });
		})
		.catch(next);
});

router.put('/user', auth.required, function (req, res, next) {
	User.findById(req.payload.id)
		.then(function (user) {
			if (!user) {
				return res.sendStatus(401);
			}

			// only update fields that were actually passed...
			if (typeof req.body.user.username !== 'undefined') {
				user.username = req.body.user.username;
			}
			if (typeof req.body.user.email !== 'undefined') {
				user.email = req.body.user.email;
			}
			if (typeof req.body.user.bio !== 'undefined') {
				user.bio = req.body.user.bio;
			}
			if (typeof req.body.user.image !== 'undefined') {
				user.image = req.body.user.image;
			}
			if (typeof req.body.user.password !== 'undefined') {
				user.setPassword(req.body.user.password);
			}

			return user.save().then(function () {
				return res.json({ user: user.toAuthJSON() });
			});
		})
		.catch(next);
});

router.post('/users/login', function (req, res, next) {
	if (!req.body.user.email) {
		return res.status(422).json({ errors: { email: "can't be blank" } });
	}

	if (!req.body.user.password) {
		return res.status(422).json({ errors: { password: "can't be blank" } });
	}

	passport.authenticate('local', { session: false }, function (err, user, info) {
		if (err) {
			return next(err);
		}

		if (user) {
			user.token = user.generateJWT();
			return res.json({ user: user.toAuthJSON() });
		} else {
			return res.status(422).json(info);
		}
	})(req, res, next);
});

router.post('/users', function (req, res, next) {
	var user = new User();

	user.username = req.body.user.username;
	user.email = req.body.user.email;
	user.setPassword(req.body.user.password);

	user
		.save()
		.then(function () {
			return res.json({ user: user.toAuthJSON() });
		})
		.catch(next);
});

module.exports = router;
*/
