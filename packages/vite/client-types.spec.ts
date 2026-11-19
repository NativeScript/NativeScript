import { describe, expectTypeOf, it } from 'vitest';
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts';
import type { BeforeRerunEventData, RebootEventData, RestartEventData } from './client.js';

describe('@nativescript/vite/client types', () => {
	it('types the NativeScript HMR events for import.meta.hot.on', () => {
		expectTypeOf<InferCustomEventPayload<'nativescript:beforeReboot'>>().toEqualTypeOf<RebootEventData>();
		expectTypeOf<InferCustomEventPayload<'nativescript:afterReboot'>>().toEqualTypeOf<RebootEventData>();
		expectTypeOf<InferCustomEventPayload<'nativescript:beforeRerun'>>().toEqualTypeOf<BeforeRerunEventData>();
		expectTypeOf<InferCustomEventPayload<'nativescript:beforeRestart'>>().toEqualTypeOf<RestartEventData>();
		expectTypeOf<RebootEventData['isRerun']>().toEqualTypeOf<(id: string) => boolean>();
		expectTypeOf<BeforeRerunEventData['modules']>().toEqualTypeOf<ReadonlyMap<string, 'changed' | 'rerun'>>();
	});
});
