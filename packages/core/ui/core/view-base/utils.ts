// Utility functions for view-base and related modules

export function booleanConverter(v: string | boolean): boolean {
	if (typeof v === 'string') {
		v = v.trim().toLowerCase();
		return v === 'true' || v === '1';
	}
	return !!v;
}
