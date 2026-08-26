import { describe, it, expect } from 'vitest';

import { Label } from '../label';
import { Button } from '../button';
import { TextField } from '../text-field';
import { paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty } from './style-properties';
import { CoreTypes } from '../../core-types';

const sideProperties = [paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty];

describe('padding setNative protocol', () => {
	it.each([
		['Label', Label],
		['Button', Button],
		['TextField', TextField],
	])('%s defines a handler for every padding side', (_name, cls: any) => {
		for (const property of sideProperties) {
			expect(typeof cls.prototype[property.setNative]).toBe('function');
		}
	});

	it('a subclass handler can chain to super, like plugins do', () => {
		class PluginLabel extends Label {
			superCalls = 0;

			[paddingTopProperty.setNative](value: CoreTypes.LengthType) {
				this.superCalls++;
				super[paddingTopProperty.setNative](value);
			}
		}

		const label = new PluginLabel();
		expect(() => (label as any)[paddingTopProperty.setNative](5)).not.toThrow();
		expect(label.superCalls).toBe(1);
	});
});
