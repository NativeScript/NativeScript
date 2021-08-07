import type { IWebpackEnv } from '@nativescript/webpack';

const ENV_FLAG_RE = /--env\.(\w+)(?:=(.+))?/;

export function parseEnvFlags(flags: string[]): IWebpackEnv {
	const envFlags = flags.filter((flag) => flag.includes('--env.'));

	const env = {};

	envFlags.map((flag) => {
		let [_, name, v] = ENV_FLAG_RE.exec(flag);
		let value: any = v;

		// convert --env.foo to --env.foo=true
		if (value === undefined) {
			value = true;
		}

		// convert true/false to boolean
		if (value === 'true' || value === 'false') {
			value = value === 'true';
		}

		// convert numbers
		if (!isNaN(value) && !isNaN(parseFloat(value))) {
			value = +value;
		}

		// duplicate key/name - convert to array
		if (name in env && value) {
			const orig = Array.isArray(env[name]) ? env[name] : [env[name]];
			env[name] = [...orig, value];
		} else {
			env[name] = value;
		}
	});

	return env;
}
