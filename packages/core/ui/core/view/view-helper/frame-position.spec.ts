import { describe, it, expect, beforeAll } from 'vitest';

import { IOSHelper } from '.';

describe('IOSHelper.getPositionFromFramePosition', () => {
	beforeAll(() => {
		(global as any).CGRectMake ??= (x: number, y: number, width: number, height: number) => ({ origin: { x, y }, size: { width, height } });
	});

	it('matches reading the position back from the frame made for it', () => {
		const positions = [
			[0, 0, 100, 50],
			[10.4, 20.6, 110.5, 70.49],
			[-5, 3, 2, 1],
			[30, 40, 20, 30],
			[1234.5678, 0.0001, 2000.123, 99.999],
		];
		for (const [left, top, right, bottom] of positions) {
			expect(IOSHelper.getPositionFromFramePosition(left, top, right, bottom)).toEqual(IOSHelper.getPositionFromFrame(IOSHelper.getFrameFromPosition({ left, top, right, bottom })));
		}
	});
});
