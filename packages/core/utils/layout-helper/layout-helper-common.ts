// cache the MeasureSpec constants here, to prevent extensive marshaling calls to and from Java
// TODO: While this boosts the performance it is error-prone in case Google changes these constants
import { MODE_MASK, UNSPECIFIED, EXACTLY, AT_MOST } from './layout-helper-shared';

export function getMode(mode: number): string {
	switch (mode) {
		case EXACTLY:
			return 'Exact';
		case AT_MOST:
			return 'AtMost';
		default:
			return 'Unspecified';
	}
}

export function getMeasureSpecMode(spec: number): number {
	return spec & MODE_MASK;
}

export function getMeasureSpecSize(spec: number): number {
	return spec & ~MODE_MASK;
}

export function measureSpecToString(measureSpec: number): string {
	const mode = getMeasureSpecMode(measureSpec);
	const size = getMeasureSpecSize(measureSpec);

	let text = 'MeasureSpec: ';
	if (mode === UNSPECIFIED) {
		text += 'UNSPECIFIED ';
	} else if (mode === EXACTLY) {
		text += 'EXACTLY ';
	} else if (mode === AT_MOST) {
		text += 'AT_MOST ';
	}

	text += size;

	return text;
}

export function round(value: number): number {
	const res = Math.floor(value + 0.5);
	if (res !== 0) {
		return res;
	} else if (value === 0) {
		return 0;
	} else if (value > 0) {
		return 1;
	}

	return -1;
}
