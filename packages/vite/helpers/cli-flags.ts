import minimist from 'minimist';

let cliFlags: Record<string, string | boolean> | null = null;

export function getCliFlags() {
	if (!cliFlags) {
		const cliArgs = minimist(process.argv.slice(2), { '--': true });
		cliFlags = (cliArgs['--'] || []).reduce((obj, flag) => {
			// remove env prefix
			const [rawKey, ...rest] = flag.replace(/^--env\./, '').split('=');
			obj[rawKey] = rest.length === 0 ? true : rest.join('=');
			return obj;
		}, {});
	}
	return cliFlags;
}
