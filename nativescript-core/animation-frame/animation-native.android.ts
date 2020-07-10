export function getTimeInFrameBase(): number {
	return java.lang.System.nanoTime() / 1000000;
}
