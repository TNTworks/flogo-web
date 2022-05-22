// require = require('esm')(module /*, options*/);
// module.exports = require('./dev-server.builder.js');

// require('ts-node/register', { project: 'tsconfig.ts-dev.json' });
require('ts-node').register({ project: 'tsconfig.ts-dev.json' });
module.exports = require('./dev-server.builder');
