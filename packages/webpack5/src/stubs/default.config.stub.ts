const webpack = require("@nativescript/webpack");

module.exports = (env) => {
	webpack.init(env);

	// todo: comments for common usage

	return webpack.resolveConfig();
};


