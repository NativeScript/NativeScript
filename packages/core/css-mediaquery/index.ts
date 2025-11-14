import { getApplicationProperties } from '../application/helpers-common';
import { Screen } from '../platform';
import { Trace } from '../trace';
import { matchQuery, MediaQueryType } from './parser';

export function checkIfMediaQueryMatches(mediaQueryString: string): boolean {
	const { widthPixels, heightPixels } = Screen.mainScreen;

	let matches: boolean;

	try {
		const appProperties = getApplicationProperties();
		matches = matchQuery(mediaQueryString, {
			type: MediaQueryType.screen,
			width: widthPixels,
			height: heightPixels,
			'device-width': widthPixels,
			'device-height': heightPixels,
			orientation: appProperties.orientation,
			'prefers-color-scheme': appProperties.systemAppearance,
		});
	} catch (err) {
		matches = false;
		Trace.write(err, Trace.categories.MediaQuery, Trace.messageType.error);
	}

	return matches;
}
