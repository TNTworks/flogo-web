module.exports = {
  name: 'plugins-stream-server',
  preset: '../../../jest.config.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../../coverage/libs/plugins/stream-server',
  setupFilesAfterEnv: ['../../../jest.setup.ts'],
};
