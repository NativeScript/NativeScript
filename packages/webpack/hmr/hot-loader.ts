import { loader } from 'webpack';
import { convertToUnixPath } from '../lib/utils';
import { extname } from 'path';
import { getOptions } from 'loader-utils';

const extMap = {
	'.css': 'style',
	'.scss': 'style',
	'.less': 'style',
	'.js': 'script',
	'.ts': 'script',
	'.xml': 'markup',
	'.html': 'markup',
};

const loader: loader.Loader = function (source, map) {
	const moduleRelativePath = this.resourcePath.replace(this.rootContext, '.');
	const modulePath = convertToUnixPath(moduleRelativePath);
	const ext = extname(modulePath).toLowerCase();
	const moduleType = extMap[ext] || 'unknown';

	const options = getOptions(this) || {};
	const alwaysSelfAccept = options.alwaysSelfAccept;
	const trace = options.trace;

	const shouldAutoAcceptCheck = `&& global._isModuleLoadedForUI && global._isModuleLoadedForUI("${modulePath}")`;
	const traceCode = `console.log("[hot-loader]: Self-accept module: ${modulePath}");`;

	const hotCode = `
if (module.hot ${alwaysSelfAccept ? '' : shouldAutoAcceptCheck} ) {
    ${trace ? traceCode : ''}
    module.hot.accept();
    module.hot.dispose(() => {
        global.hmrRefresh({ type: "${moduleType}", path: "${modulePath}" });
    });
}`;

	this.callback(null, `${source}; ${hotCode} `, map);
};

export default loader;
