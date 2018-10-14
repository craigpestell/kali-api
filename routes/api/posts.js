var keystone = require('keystone');

var Posts = keystone.list('Post');

/**
 * List Posts
 */
exports.list = function (req, res) {
	Posts.model.find(function (err, items) {
		if (err) return res.json({ err: err });

		res.json({
			posts: items,
		});
	});
};

/**
 * Get Posts by ID
 */
exports.get = function (req, res) {
	Posts.model.findById(req.params.id).exec(function (err, item) {
		if (err) return res.json({ err: err });
		if (!item) return res.json('not found');

		res.json({
			post: item,
		});
	});
};

/**
 * Create a Posts
 */
exports.create = function (req, res) {
	var item = new Posts.model(),
		data = req.method == 'POST' ? req.body : req.query;

	item.getUpdateHandler(req).process(data, function (err) {
		if (err) return res.json({ error: err });

		res.json({
			post: item,
		});
	});
};

/**
 * Patch Posts by ID
 */
exports.update = function (req, res) {
	Posts.model.findById(req.params.id).exec(function (err, item) {
		if (err) return res.json({ err: err });
		if (!item) return res.json({ err: 'not found' });

		var data = req.method == 'PUT' ? req.body : req.query;

		item.getUpdateHandler(req).process(data, function (err) {
			if (err) return res.json({ err: err });

			res.json({
				post: item,
			});
		});
	});
};

/**
 * Delete Posts by ID
 */
exports.remove = function (req, res) {
	Posts.model.findById(req.params.id).exec(function (err, item) {
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
