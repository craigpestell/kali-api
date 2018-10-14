module.exports = {
	apps: [
		{
			name: 'API',
			script: 'keystone.js',

			// Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
			args: '',
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'development',
			},
			env_production: {
				NODE_ENV: 'production',
			},
		},
	],

	deploy: {
		development: {
			'user': 'repn',
			'host': 'kali-dev',
			'ref': 'origin/master',
			'repo': 'git@github.com:craigpestell/kali-api.git',
			'path': '~/workspace/kali-api',
			'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
		},
		production: {
			'user': 'node',
			'host': 'kali-prod',
			'ref': 'origin/master',
			'repo': 'git@github.com:craigpestell/kali-api.git',
			'path': '~/workspace/kali-api',
			'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
		},
	},
};
