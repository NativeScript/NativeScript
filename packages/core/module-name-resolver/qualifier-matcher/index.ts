const MIN_WH: string = 'minWH';
const MIN_W: string = 'minW';
const MIN_H: string = 'minH';
const PRIORITY_STEP = 10000;

/**
 * Used with qualifier matchers and module resolution
 */
export interface PlatformContext {
	width: number;
	height: number;
	os: string;
	deviceType: string;
}

interface QualifierSpec {
	isMatch(path: string): boolean;
	getMatchOccurences(path: string): Array<string>;
	getMatchValue(value: string, context: PlatformContext): number;
}

const minWidthHeightQualifier: QualifierSpec = {
	isMatch: function (path: string): boolean {
		return new RegExp(`.${MIN_WH}\\d+`).test(path);
	},
	getMatchOccurences: function (path: string): Array<string> {
		return path.match(new RegExp(`.${MIN_WH}\\d+`, 'g'));
	},
	getMatchValue(value: string, context: PlatformContext): number {
		const numVal = parseInt(value.substr(MIN_WH.length + 1));
		if (isNaN(numVal)) {
			return -1;
		}

		const actualLength = Math.min(context.width, context.height);
		if (actualLength < numVal) {
			return -1;
		}

		return PRIORITY_STEP - (actualLength - numVal);
	},
};

const minWidthQualifier: QualifierSpec = {
	isMatch: function (path: string): boolean {
		return new RegExp(`.${MIN_W}\\d+`).test(path) && !new RegExp(`.${MIN_WH}\\d+`).test(path);
	},
	getMatchOccurences: function (path: string): Array<string> {
		return path.match(new RegExp(`.${MIN_W}\\d+`, 'g'));
	},
	getMatchValue(value: string, context: PlatformContext): number {
		const numVal = parseInt(value.substr(MIN_W.length + 1));
		if (isNaN(numVal)) {
			return -1;
		}

		const actualWidth = context.width;
		if (actualWidth < numVal) {
			return -1;
		}

		return PRIORITY_STEP - (actualWidth - numVal);
	},
};

const minHeightQualifier: QualifierSpec = {
	isMatch: function (path: string): boolean {
		return new RegExp(`.${MIN_H}\\d+`).test(path) && !new RegExp(`.${MIN_WH}\\d+`).test(path);
	},
	getMatchOccurences: function (path: string): Array<string> {
		return path.match(new RegExp(`.${MIN_H}\\d+`, 'g'));
	},
	getMatchValue(value: string, context: PlatformContext): number {
		const numVal = parseInt(value.substr(MIN_H.length + 1));
		if (isNaN(numVal)) {
			return -1;
		}

		const actualHeight = context.height;
		if (actualHeight < numVal) {
			return -1;
		}

		return PRIORITY_STEP - (actualHeight - numVal);
	},
};

const platformQualifier: QualifierSpec = {
	isMatch: function (path: string): boolean {
		return path.includes('.android') || path.includes('.ios');
	},
	getMatchOccurences: function (path: string): Array<string> {
		return path.match(new RegExp('\\.android|\\.ios', 'g'));
	},
	getMatchValue(value: string, context: PlatformContext): number {
		const val = value.substr(1);

		return val === context.os.toLowerCase() ? 1 : -1;
	},
};

const orientationQualifier: QualifierSpec = {
	isMatch: function (path: string): boolean {
		return path.includes('.land') || path.includes('.port');
	},
	getMatchOccurences: function (path: string): Array<string> {
		return path.match(new RegExp('\\.land|\\.port', 'g'));
	},
	getMatchValue(value: string, context: PlatformContext): number {
		const val = value.substr(1);
		const isLandscape: number = context.width > context.height ? 1 : -1;

		return val === 'land' ? isLandscape : -isLandscape;
	},
};

// List of supported qualifiers ordered by priority
const supportedQualifiers: Array<QualifierSpec> = [minWidthHeightQualifier, minWidthQualifier, minHeightQualifier, orientationQualifier, platformQualifier];

function checkQualifiers(path: string, context: PlatformContext): number {
	let result = 0;
	for (let i = 0; i < supportedQualifiers.length; i++) {
		let qualifier = supportedQualifiers[i];
		if (qualifier.isMatch(path)) {
			let occurences = qualifier.getMatchOccurences(path);
			// Always get the last qualifier among identical occurences
			result = qualifier.getMatchValue(occurences[occurences.length - 1], context);
			if (result < 0) {
				// Non of the supported qualifiers matched this or the match was not satisfied
				return -1;
			}

			result += (supportedQualifiers.length - i) * PRIORITY_STEP;

			return result;
		}
	}

	return result;
}

export function stripQualifiers(path: string): string {
	// Strip qualifiers from path if any
	for (let i = 0; i < supportedQualifiers.length; i++) {
		let qualifier = supportedQualifiers[i];
		if (qualifier.isMatch(path)) {
			let occurences = qualifier.getMatchOccurences(path);
			for (let j = 0; j < occurences.length; j++) {
				path = path.replace(occurences[j], '');
			}
		}
	}

	return path;
}

export function findMatch(path: string, ext: string, candidates: Array<string>, context: PlatformContext): string {
	let fullPath: string = ext ? path + ext : path;
	let bestValue = -1;
	let result: string = null;

	for (let i = 0; i < candidates.length; i++) {
		const filePath = candidates[i];

		// Check if candidate is correct for given path
		const cleanFilePath: string = stripQualifiers(filePath);
		if (cleanFilePath !== fullPath) {
			continue;
		}

		const value = checkQualifiers(filePath, context);

		if (value >= 0 && value > bestValue) {
			bestValue = value;
			result = candidates[i];
		}
	}

	return result;
}
