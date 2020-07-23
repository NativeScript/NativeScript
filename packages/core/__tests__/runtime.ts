import 'tslib';

import * as moduleAlias from 'module-alias';
import * as path from 'path';

const tnsCoreModules = path.resolve(__dirname, '..');

moduleAlias.addPath(tnsCoreModules);
moduleAlias.addAliases({
	// NOTE: require("@nativescript/core/platform") with these aliases will work in node but fail in Angular AoT
	'@nativescript/core/platform': path.resolve(__dirname, 'polyfills', 'platform'),
	'@nativescript/core/file-system/file-system-access': path.resolve(__dirname, 'polyfills', 'file-system-access'),
	'@nativescript/core/utils/utils': path.resolve(tnsCoreModules, 'utils/utils-common'),
	'./layout-helper': path.resolve(tnsCoreModules, 'utils/layout-helper/layout-helper-common'),
	'./mainthread-helper': path.resolve(__dirname, 'polyfills', 'mainthread-helper'),
	'@nativescript/core/color': path.resolve(tnsCoreModules, 'color/color-common'),
	'@nativescript/core/ui/styling/font': path.resolve(tnsCoreModules, 'ui/styling/font-common'),
	'@nativescript/core/ui/styling/background': path.resolve(tnsCoreModules, 'ui/styling/background-common'),

	'@nativescript/core': tnsCoreModules,
	'~': __dirname,
});
