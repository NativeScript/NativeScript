module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
	moduleNameMapper: {
  	'^@nativescript/webpack$': '<rootDir>/src'
	},
	setupFiles: [
		'<rootDir>/jest.setup.ts'
	]
};
