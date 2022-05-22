module.exports = {
  name: 'server',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/server',
  setupFilesAfterEnv: ['../../jest.setup.ts'],
  testEnvironment: 'node',
};
