import { dedent } from 'ts-dedent';
import { basename } from 'path';
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

		const code = dedent`
			// Added by app-css-loader
			import "./${basename(res)}";
			${content}
		`;

		callback(null, code, map);
	});
}
