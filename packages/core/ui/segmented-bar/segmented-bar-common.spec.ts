import { describe, it, expect } from 'vitest';
import { SegmentedBarBase } from './segmented-bar-common';

class SegmentedBar extends SegmentedBarBase {}

describe('SegmentedBarBase.androidSegmentStyle', () => {
	it('defaults to tabs and accepts pill', () => {
		const bar = new SegmentedBar();
		expect(bar.androidSegmentStyle).toBe('tabs');
		bar.androidSegmentStyle = 'pill';
		expect(bar.androidSegmentStyle).toBe('pill');
	});
});
