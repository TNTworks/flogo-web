module.exports = {
  name: 'plugins-stream-core',
  preset: '../../../jest.config.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../../coverage/libs/plugins/stream-core',
  // todo: switch for setupFilesAfterEnv after https://github.com/nrwl/nx/issues/1343 is fixed
  setupFilesAfterEnv: ['../../../jest.setup.ts'],
};
