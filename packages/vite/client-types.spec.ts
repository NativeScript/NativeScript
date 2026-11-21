import fs from 'node:fs';
import ts from 'typescript';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { ModuleNamespace } from 'vite/types/hot.d.ts';
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

	it('keeps the vite/client reference in the emitted declaration, so apps get import.meta.hot from it alone', () => {
		const source = fs.readFileSync(new URL('./client.ts', import.meta.url), 'utf8');
		const { outputText } = ts.transpileDeclaration(source, { fileName: 'client.ts' });
		expect(outputText).toMatch(/^\/\/\/ <reference types="vite\/client" preserve="true" \/>$/m);
	});

	it('types the self-accept callback and the dispose data bag', () => {
		type Hot = NonNullable<ImportMeta['hot']>;
		expectTypeOf<Hot['accept']>().toBeCallableWith((mod: ModuleNamespace | undefined) => mod?.value);
		expectTypeOf<Hot['dispose']>().toBeCallableWith((data: any) => {
			data.count = (data.count ?? 0) + 1;
		});
	});
});
