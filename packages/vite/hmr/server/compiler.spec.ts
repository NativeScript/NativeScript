import { describe, expect, it } from 'vitest';

import { compileTemplate } from '../frameworks/vue/server/sfc-route-shared.js';
import { isNativeTag } from './compiler.js';

describe('NS_NATIVE_TAGS', () => {
	it('treats core views as custom elements', () => {
		expect(isNativeTag('Label')).toBe(true);
		expect(isNativeTag('GridLayout')).toBe(true);
	});

	it('leaves Vue component wrappers that take slot templates to resolveComponent', () => {
		expect(isNativeTag('CollectionView')).toBe(false);
	});

	// The HMR assembler compiles SFC templates with this predicate; a scoped slot on
	// a tag it calls an element makes the compiler throw and the SFC falls back to a
	// stale or synthesized render.
	it('compiles a CollectionView scoped slot with the assembler predicate', () => {
		const source = `<GridLayout><CollectionView :items="items"><template #default="{ item, index }"><Label :text="item.name" /></template></CollectionView></GridLayout>`;
		const result = compileTemplate({ source, id: 'home', filename: '/app/components/Home.vue', isProd: false, ssr: false, compilerOptions: { isCustomElement: isNativeTag } });
		expect(result.errors).toEqual([]);
		expect(result.code).toContain('resolveComponent("CollectionView")');
	});
});
