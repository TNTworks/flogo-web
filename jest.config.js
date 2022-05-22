const projectsConfig = require('./angular.json');
const jestProjectRoots = getJestProjectsRoots(projectsConfig).join(',');

module.exports = {
  globals: {
    'ts-jest': {
      tsConfigFile: './tsconfig.spec.json',
    },
    __TS_CONFIG__: {
      inlineSourceMap: true,
    },
    __TRANSFORM_HTML__: true,
  },
  testMatch: [`**/{${jestProjectRoots}}/**/+(*.)+(spec|test).+(ts|js)?(x)`],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  preset: 'ts-jest',
  resolver: '@nrwl/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageReporters: ['html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

function getJestProjectsRoots(projectsConfig) {
  const jestPattern = /jest/;
  const projectUsesJest = project => {
    const testConfig = (project.architect || {}).test || {};
    return testConfig.builder && jestPattern.test(testConfig.builder);
  };
  return Object.values(projectsConfig.projects)
    .filter(projectUsesJest)
    .map(p => p.root.replace(/\/$/, ''));
}
