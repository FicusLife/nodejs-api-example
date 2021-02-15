module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  projects: ['<rootDir>/pkg/api/*/jest.config.js'],
};
