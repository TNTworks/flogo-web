module.exports = {
  name: 'plugins-stream-client',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/plugins/stream-client',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
  setupFilesAfterEnv: ['./src/test.setup.ts'],
};
