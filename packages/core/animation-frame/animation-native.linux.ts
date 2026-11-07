// GDK frame times are g_get_monotonic_time() microseconds
export function getTimeInFrameBase(): number {
	return Number(g_get_monotonic_time()) / 1000;
}
