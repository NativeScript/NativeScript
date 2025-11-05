/**
 * Default animation values used throughout core
 */
export const CORE_ANIMATION_DEFAULTS = {
	duration: 0.35,
	spring: {
		tension: 140,
		friction: 10,
		mass: 1,
		velocity: 0,
	},
};

/**
 * Get a duration with damping value from various spring related settings.
 * Helpful when needing to convert spring settings to isolated duration value.
 * @param springSettings various spring settings
 * @returns calculated duration with damping from spring settings
 */
export function getDurationWithDampingFromSpring(springSettings?: { tension?: number; friction?: number; mass?: number; velocity?: number }) {
	// for convenience, default spring settings are provided
	const opt = {
		...CORE_ANIMATION_DEFAULTS.spring,
		...(springSettings || {}),
	};
	const damping = opt.friction / Math.sqrt(2 * opt.tension);
	const undampedFrequency = Math.sqrt(opt.tension / opt.mass);

	// console.log({
	// 	damping,
	// 	undampedFrequency
	// })

	const epsilon = 0.001;
	let duration = 0;

	if (damping < 1) {
		// console.log('damping < 1');
		const a = Math.sqrt(1 - Math.pow(damping, 2));
		const b = opt.velocity / (a * undampedFrequency);
		const c = damping / a;
		const d = -((b - c) / epsilon);
		if (d > 0) {
			duration = Math.log(d) / (damping * undampedFrequency);
		}
	}
	return {
		duration,
		damping,
	};
}
