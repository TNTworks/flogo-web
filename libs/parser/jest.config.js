module.exports = {
  name: 'parser',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/parser',
  // todo: switch for setupFilesAfterEnv after https://github.com/nrwl/nx/issues/1343 is fixed
  setupFilesAfterEnv: ['../../jest.setup.ts'],
};
