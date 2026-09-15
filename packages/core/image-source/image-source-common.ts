import type { ImageFilter, ImageMetadata, ImageTransformOptions } from '.';

export function getScaledDimensions(width: number, height: number, maxSize: number) {
	if (height >= width) {
		if (height <= maxSize) {
			// if image already smaller than the required height
			return { width, height };
		}

		return {
			width: Math.round((maxSize * width) / height),
			height: maxSize,
		};
	}

	if (width <= maxSize) {
		// if image already smaller than the required width
		return { width, height };
	}

	return {
		width: maxSize,
		height: Math.round((maxSize * height) / width),
	};
}

/**
 * Normalizes a caller-supplied quality (0-100) to an integer in range. Undefined
 * means "maximum quality" on both platforms.
 */
export function normalizeQuality(quality: number | undefined): number {
	if (typeof quality !== 'number' || Number.isNaN(quality)) {
		return 100;
	}

	return Math.max(0, Math.min(100, Math.round(quality)));
}

export function normalizeFormat(format: string): 'png' | 'jpeg' {
	if (typeof format === 'string' && format.toLowerCase() === 'png') {
		return 'png';
	}

	return 'jpeg';
}

export function assertPositiveInteger(value: number, name: string): number {
	if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
		throw new Error(`${name} must be a positive number of pixels, got ${value}`);
	}

	return Math.round(value);
}

const FILTER_TYPES = ['grayscale', 'sepia', 'invert', 'brightness', 'contrast', 'saturation', 'blur'];

/**
 * Validates the filter list and returns plain objects that serialize cleanly to
 * the native side (JSON on Android, NSDictionary on iOS).
 */
export function normalizeFilters(filters: ImageFilter[]): Array<{ type: string; amount?: number; radius?: number }> {
	if (!Array.isArray(filters)) {
		throw new Error('applyFilters expects an array of filters');
	}

	return filters.map((filter) => {
		const type = filter?.type;
		if (FILTER_TYPES.indexOf(type) === -1) {
			throw new Error(`Unknown image filter type '${type}'`);
		}

		const result: { type: string; amount?: number; radius?: number } = { type };
		if ('amount' in filter && typeof filter.amount === 'number') {
			result.amount = filter.amount;
		}

		if ('radius' in filter && typeof filter.radius === 'number') {
			result.radius = Math.max(0, filter.radius);
		}

		return result;
	});
}

/**
 * Validates transform options. Colours are converted by the platform layer since
 * the native colour object differs per platform.
 */
export function normalizeTransformOptions(options: ImageTransformOptions): ImageTransformOptions {
	if (!options || typeof options !== 'object') {
		throw new Error('transform expects an options object');
	}

	const result: ImageTransformOptions = {};
	if (options.crop) {
		result.crop = {
			x: Math.round(options.crop.x),
			y: Math.round(options.crop.y),
			width: assertPositiveInteger(options.crop.width, 'crop.width'),
			height: assertPositiveInteger(options.crop.height, 'crop.height'),
		};
	}

	if (typeof options.rotate === 'number') {
		result.rotate = options.rotate;
	}

	if (options.flip) {
		result.flip = options.flip;
	}

	if (options.resize) {
		if ('maxSize' in options.resize) {
			result.resize = { maxSize: assertPositiveInteger(options.resize.maxSize, 'resize.maxSize') };
		} else {
			result.resize = {
				...options.resize,
				width: assertPositiveInteger(options.resize.width, 'resize.width'),
				height: assertPositiveInteger(options.resize.height, 'resize.height'),
				mode: options.resize.mode || 'fit',
			};
		}
	}

	return result;
}

/**
 * Converts the flat metadata object produced by the native helpers into the public shape.
 */
export function toImageMetadata(raw: any): ImageMetadata {
	if (!raw) {
		return null;
	}

	const metadata: ImageMetadata = {
		width: Number(raw.width),
		height: Number(raw.height),
		orientation: Number(raw.orientation) || 1,
		hasAlpha: !!raw.hasAlpha,
	};

	if (raw.mimeType) {
		metadata.mimeType = String(raw.mimeType);
	}

	if (raw.colorSpace) {
		metadata.colorSpace = String(raw.colorSpace);
	}

	if (typeof raw.dpi === 'number' && raw.dpi > 0) {
		metadata.dpi = raw.dpi;
	}

	if (typeof raw.dateTaken === 'number' && raw.dateTaken > 0) {
		metadata.dateTaken = new Date(raw.dateTaken);
	}

	if (raw.gps && typeof raw.gps.latitude === 'number' && typeof raw.gps.longitude === 'number') {
		metadata.gps = { latitude: raw.gps.latitude, longitude: raw.gps.longitude };
	}

	return metadata;
}

/**
 * Number of differing bits between two 16-character hex hashes, or -1 when either is invalid.
 */
export function hammingDistance(a: string, b: string): number {
	if (typeof a !== 'string' || typeof b !== 'string' || a.length !== 16 || b.length !== 16) {
		return -1;
	}

	let distance = 0;
	for (let i = 0; i < 16; i++) {
		const x = parseInt(a[i], 16);
		const y = parseInt(b[i], 16);
		if (Number.isNaN(x) || Number.isNaN(y)) {
			return -1;
		}

		let diff = x ^ y;
		while (diff) {
			distance += diff & 1;
			diff >>= 1;
		}
	}

	return distance;
}
