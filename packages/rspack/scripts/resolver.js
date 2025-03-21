const { relative, join } = require('path');

const packagesToMakeRelative = new Set([
	'@angular-devkit/build-angular/src/tools/babel/webpack-loader',
	'@angular-devkit/build-angular/src/babel/webpack-loader',
]);

function resolver(path, options) {
	const defaultResolver = options.defaultResolver(path, options);
	if (typeof defaultResolver === 'string' && packagesToMakeRelative.has(path)) {
		return join('<rootDir>', relative(join(__dirname, '..'), defaultResolver));
	}
	return defaultResolver;
}

module.exports = resolver;
