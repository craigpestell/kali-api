/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#keystoneApp.VERB
 */
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');
const keystone = require('keystone');

var auth = require('./auth');

var importRoutes = keystone.importer(__dirname);
const routes = {
	api: importRoutes('./api'),
};

// Setup Route Bindings
exports = module.exports = nextApp => keystoneApp => {
	// Next request handler
	const handle = nextApp.getRequestHandler();


	// API

	// mock for now.
	keystoneApp.get('/api/tags', (req, res, next) => {
		res.json(require('./api/mocks/tags'));
		next();
	});

	keystoneApp.get('/api/user', auth.required, routes.api.user.get);
	keystoneApp.put('/api/user', auth.required, routes.api.user.put);

	keystoneApp.post('/api/users/', auth.required, routes.api.user.create);

	keystoneApp.post('/api/users/login/', auth.required, routes.api.users.login);

	keystoneApp.post('/api/posts', auth.required, routes.api.posts.create);

	keystoneApp.get('/api/posts/feed/?', routes.api.posts.list);
	keystoneApp.get('/api/posts', routes.api.posts.list);
	keystoneApp.get('/api/posts/:id', routes.api.posts.get);
	keystoneApp.post('/api/posts', auth.required, routes.api.posts.create);
	keystoneApp.put('/api/posts/:id', auth.required, routes.api.posts.update);
	keystoneApp.delete('/api/posts/:id', auth.required, routes.api.posts.remove);

	keystoneApp.get('/api/people', routes.api.people.list);
	keystoneApp.get('/api/people/:id', routes.api.people.get);

	keystoneApp.post('/api/people', auth.required, routes.api.people.create);
	keystoneApp.put('/api/people/:id', auth.required, routes.api.people.update);
	keystoneApp.delete('/api/people/:id', auth.required, routes.api.people.remove);

	keystoneApp.get('/api/planets', routes.api.planet.list);
	keystoneApp.get('/api/planets/:id', routes.api.planet.get);
	keystoneApp.post('/api/planets', auth.required, routes.api.planet.create);
	keystoneApp.put('/api/planets/:id', auth.required, routes.api.planet.update);
	keystoneApp.delete('/api/planets/:id', auth.required, routes.api.planet.remove);

	keystoneApp.get('/api/starships', routes.api.starship.list);
	keystoneApp.get('/api/starships/:id', routes.api.starship.get);
	keystoneApp.post('/api/starships', auth.required, routes.api.starship.create);
	keystoneApp.put('/api/starships/:id', auth.required, routes.api.starship.update);
	keystoneApp.delete('/api/starships/:id', auth.required, routes.api.starship.remove);
	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// keystoneApp.get('/protected', middleware.requireUser, routes.views.protected);

	keystoneApp.get('/api/posts', (req, res, next) => {
		const Post = keystone.list('Post');
		Post.model
			.find()
			.where('state', 'published')
			.sort('-publishedDate')
			.exec(function (err, results) {
				if (err) throw err;
				res.json(results);
			});
	});

	keystoneApp.use(function (err, req, res, next) {
		if (err.name === 'ValidationError') {
			return res.status(422).json({
				errors: Object.keys(err.errors).reduce(function (errors, key) {
					errors[key] = err.errors[key].message;

					return errors;
				}, {}),
			});
		}

		return next(err);
	});

	keystoneApp.get('*', (req, res) => {
		return handle(req, res);
	});
};
