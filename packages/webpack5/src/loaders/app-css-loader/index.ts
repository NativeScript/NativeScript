import { basename } from 'path';
import { sources } from 'webpack';

/**
 * This loader tries to load an `app.scss` or and `app.css` relative to the main entry
 */
export default function loader(content: string, map: any) {
	const { platform } = this.getOptions();
	const callback = this.async();
	const resolve = this.getResolve({
		extensions: [`.${platform}.scss`, `.${platform}.css`, '.scss', '.css'],
	});

	resolve(this.context, './app', (err, res) => {
		if (err || !res) {
			// if we ran into an error or there's no css file found, we just return
			// original content and not append any additional imports.
			return callback(null, content, map);
		}

		const prefix = `// Added by app-css-loader\nimport "./${basename(res)}";\n`;
		if (!map) {
			return callback(null, prefix + content);
		}

		// The prefix shifts every line, so the incoming map must be offset too.
		const { source, map: outputMap } = new sources.ConcatSource(
			new sources.RawSource(prefix),
			new sources.SourceMapSource(content, this.resourcePath, map),
		).sourceAndMap();
		callback(null, source, outputMap);
	});
}
