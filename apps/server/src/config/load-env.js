const findUp = require('find-up');
const dotenv = require('dotenv');

const pathToEnvFile = findUp.sync('.env');
if (pathToEnvFile) {
  dotenv.config({ path: pathToEnvFile });
}
