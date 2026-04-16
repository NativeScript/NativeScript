import { describe, expect, it } from 'vitest';

import { shouldSuppressDefaultViteHotUpdate } from './websocket.js';

describe('shouldSuppressDefaultViteHotUpdate', () => {
	it('suppresses default Vite hot handling for Angular template edits', () => {
		expect(
			shouldSuppressDefaultViteHotUpdate({
				flavor: 'angular',
				file: '/src/app/components/login/login.component.html',
			}),
		).toBe(true);
	});

	it('suppresses default Vite hot handling for Angular TypeScript edits', () => {
		expect(
			shouldSuppressDefaultViteHotUpdate({
				flavor: 'angular',
				file: '/src/app/components/login/login.component.ts',
			}),
		).toBe(true);
	});

	it('keeps default Vite handling for non-Angular or unsupported files', () => {
		expect(
			shouldSuppressDefaultViteHotUpdate({
				flavor: 'angular',
				file: '/src/app/app.css',
			}),
		).toBe(false);

		expect(
			shouldSuppressDefaultViteHotUpdate({
				flavor: 'vue',
				file: '/src/App.vue',
			}),
		).toBe(false);
	});
});
