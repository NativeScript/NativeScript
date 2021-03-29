import { dedent } from 'ts-dedent';

/**
 * This loader tries to load an `app.scss` or and `app.css` relative to the main entry
 */
export default function loader(content: string, map: any) {
	const callback = this.async();
	const resolve = this.getResolve({
		extensions: ['.scss', '.css'],
	});

	resolve(this.context, './app', (err, res) => {
		if (err || !res) {
			return callback(null, content, map);
		}

		const code = dedent`
			// Added by app-css-loader
			import "${res}";
			${content}
		`;

		callback(null, code, map);
	});
}
