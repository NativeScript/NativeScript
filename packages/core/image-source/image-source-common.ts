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
