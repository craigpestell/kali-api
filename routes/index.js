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
var importRoutes = keystone.importer(__dirname);
const routes = {
	api: importRoutes('./api'),
};

// Setup Route Bindings
exports = module.exports = nextApp => keystoneApp => {
	// Next request handler
	const handle = nextApp.getRequestHandler();

	var authCheck = jwt({
		secret: jwks.expressJwtSecret({
			cache: true,
			rateLimit: true,
			jwksRequestsPerMinute: 5,
			// YOUR-AUTH0-DOMAIN name e.g https://prosper.auth0.com
			jwksUri: 'https://kaliprotectives.auth0.com/.well-known/jwks.json',
		}),
		// This is the identifier we set when we created the API
		audience: 'https://kaliprotectives.com/api',
		issuer: 'https://kaliprotectives.auth0.com',
		algorithms: ['RS256'],
	});

	// API
	keystoneApp.get('/api/people', routes.api.people.list);
	keystoneApp.get('/api/people/:id', routes.api.people.get);

	keystoneApp.post('/api/people', authCheck, routes.api.people.create);
	keystoneApp.put('/api/people/:id', authCheck, routes.api.people.update);
	keystoneApp.delete('/api/people/:id', authCheck, routes.api.people.remove);

	keystoneApp.get('/api/planets', routes.api.planet.list);
	keystoneApp.get('/api/planets/:id', routes.api.planet.get);
	keystoneApp.post('/api/planets', authCheck, routes.api.planet.create);
	keystoneApp.put('/api/planets/:id', authCheck, routes.api.planet.update);
	keystoneApp.delete('/api/planets/:id', authCheck, routes.api.planet.remove);

	keystoneApp.get('/api/starships', routes.api.starship.list);
	keystoneApp.get('/api/starships/:id', routes.api.starship.get);
	keystoneApp.post('/api/starships', authCheck, routes.api.starship.create);
	keystoneApp.put('/api/starships/:id', authCheck, routes.api.starship.update);
	keystoneApp.delete('/api/starships/:id', authCheck, routes.api.starship.remove);
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

	keystoneApp.get('*', (req, res) => {
		return handle(req, res);
	});
};
