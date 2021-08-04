import { dedent } from 'ts-dedent';

const cssLoaderWarning = dedent`
	The apply-css-loader requires the file to be pre-processed by either css-loader or css2json-loader.
	Make sure the appropriate loader is applied before apply-css-loader.
`;

export default function loader(content, map) {
	const hasLoader = (loader: string) => {
		return this.loaders
			?.slice(this.loaderIndex)
			.some(({ path }) => path.includes(loader));
	};
	// add a tag to the applied css
	const tag = JSON.stringify(this.resourcePath);
	const tagCode =
		this.mode === 'development' ? `, ${JSON.stringify(this.resourcePath)}` : '';

	const hmrCode = this.hot
		? dedent`
			if(module.hot) {
				module.hot.accept()
				module.hot.dispose(() => {
					const { removeTaggedAdditionalCSS } = require("@nativescript/core/ui/styling/style-scope");
					removeTaggedAdditionalCSS(${tag})
				})
			}
		`
		: ``;

	if (hasLoader('css2json-loader')) {
		content = dedent`
			${content}
			const { addTaggedAdditionalCSS } = require("@nativescript/core/ui/styling/style-scope");
			addTaggedAdditionalCSS(___CSS2JSON_LOADER_EXPORT___${tagCode})
			${hmrCode}
		`;
	} else if (hasLoader('css-loader')) {
		content = dedent`
			${content}
			const { addTaggedAdditionalCSS } = require("@nativescript/core/ui/styling/style-scope");
			if (___CSS_LOADER_EXPORT___ && typeof ___CSS_LOADER_EXPORT___.forEach === "function") {
				___CSS_LOADER_EXPORT___.forEach(cssExport => {
					if (cssExport.length > 1 && cssExport[1]) {
						// applying the second item of the export as it contains the css contents
						addTaggedAdditionalCSS(cssExport[1]${tagCode});
					}
				});
			}
			${hmrCode}
		`;
	} else {
		this.emitWarning(new Error(cssLoaderWarning));
	}

	this.callback(null, content, null);
}
