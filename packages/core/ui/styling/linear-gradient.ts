import { CoreTypes } from '../../core-types';
import { Color } from '../../color';
import type { LinearGradient as CSSLinearGradient } from '../../css/parser';

export interface ColorStop {
	color: Color;
	offset?: CoreTypes.LengthPercentUnit;
}

/**
 * Positions for every color stop, per CSS: a first stop without a position
 * sits at 0, a last one at 1, a run of unpositioned stops is spread evenly
 * between its positioned neighbours, and a position lower than one before it
 * is raised to that value.
 */
export function resolveGradientStopOffsets(colorStops: readonly ColorStop[]): number[] {
	const count = colorStops.length;
	if (count === 0) {
		return [];
	}
	const offsets: (number | undefined)[] = colorStops.map((stop) => (stop.offset ? stop.offset.value : undefined));
	if (offsets[0] === undefined) {
		offsets[0] = 0;
	}
	if (offsets[count - 1] === undefined) {
		offsets[count - 1] = 1;
	}
	let highest = offsets[0];
	for (let i = 1; i < count; i++) {
		const offset = offsets[i];
		if (offset !== undefined) {
			offsets[i] = Math.max(offset, highest);
			highest = offsets[i];
		}
	}
	let start = 0;
	for (let i = 1; i < count; i++) {
		if (offsets[i] === undefined) {
			continue;
		}
		const gap = i - start;
		for (let k = start + 1; k < i; k++) {
			offsets[k] = offsets[start] + ((offsets[i] - offsets[start]) * (k - start)) / gap;
		}
		start = i;
	}
	return offsets as number[];
}

export class LinearGradient {
	public angle: number;
	public colorStops: ColorStop[];

	public static parse(value: CSSLinearGradient): LinearGradient {
		const result = new LinearGradient();
		result.angle = value.angle;
		result.colorStops = value.colors.map((color) => {
			const offset = color.offset || null;
			let offsetUnit: CoreTypes.LengthPercentUnit;

			if (offset && offset.unit === '%') {
				offsetUnit = {
					unit: '%',
					value: offset.value,
				};
			}

			return {
				color: color.color,
				offset: offsetUnit,
			};
		});

		return result;
	}

	public static equals(first: LinearGradient, second: LinearGradient): boolean {
		if (!first && !second) {
			return true;
		} else if (!first || !second) {
			return false;
		}

		if (first.angle !== second.angle) {
			return false;
		}

		if (first.colorStops.length !== second.colorStops.length) {
			return false;
		}

		for (let i = 0; i < first.colorStops.length; i++) {
			const firstStop = first.colorStops[i];
			const secondStop = second.colorStops[i];
			if (firstStop.offset !== secondStop.offset) {
				return false;
			}
			if (!Color.equals(firstStop.color, secondStop.color)) {
				return false;
			}
		}

		return true;
	}
}
