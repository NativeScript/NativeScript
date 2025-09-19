// Shared layout constants and helpers for layout-helper, used by both common and platform-specific files.
// Only put platform-agnostic logic here.

export const MODE_SHIFT = 30;
export const MODE_MASK = 0x3 << MODE_SHIFT;
export const UNSPECIFIED = 0 << MODE_SHIFT;
export const EXACTLY = 1 << MODE_SHIFT;
export const AT_MOST = 2 << MODE_SHIFT;
export const MEASURED_HEIGHT_STATE_SHIFT = 0x00000010;
export const MEASURED_STATE_TOO_SMALL = 0x01000000;
export const MEASURED_STATE_MASK = 0xff000000;
export const MEASURED_SIZE_MASK = 0x00ffffff;
// Add more shared constants/helpers as needed.
