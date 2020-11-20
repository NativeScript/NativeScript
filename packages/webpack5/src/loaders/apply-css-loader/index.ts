import { dedent } from 'ts-dedent';

const cssLoaderWarning = dedent`
	The apply-css-loader requires the file to be pre-processed by css-loader.
	Make sure css-loader is applied before apply-css-loader.
`;

function hasCssLoader(loaders: any[], loaderIndex: number) {
	return loaders
		?.slice(loaderIndex)
		.some(({ path }) => path.includes('css-loader'));
}

export default function loader(content, map) {
	// if (this.request.match(/\/app\.(css|scss|less|sass)$/)) {
	// 	return content;
	// }

	// Emit a warning if the file was not processed by the css-loader.
	if (!hasCssLoader(this.loaders, this.loaderIndex)) {
		this.emitWarning(new Error(cssLoaderWarning));
	}

	content = dedent`
		/* CSS START */
		${content}
		/* CSS END */

		/* APPLY CSS */
		const { Application } = require("@nativescript/core");
		require("@nativescript/core/ui/styling/style-scope");

		if (___CSS_LOADER_EXPORT___ && typeof ___CSS_LOADER_EXPORT___.forEach === "function") {
			___CSS_LOADER_EXPORT___.forEach(cssExport => {
				if (cssExport.length > 1 && cssExport[1]) {
					// applying the second item of the export as it contains the css contents
					Application.addCss(cssExport[1]);
				}
			});
		}
	`;

	this.callback(null, content, map);
}
