import { isNativeClassTransformerDisabled } from '../../src/helpers/nativeClassTransformer';

describe('isNativeClassTransformerDisabled', () => {
	const originalEnv = process.env.NS_DISABLE_NATIVE_CLASS_TRANSFORMER;

	afterEach(() => {
		if (originalEnv === undefined) {
			delete process.env.NS_DISABLE_NATIVE_CLASS_TRANSFORMER;
		} else {
			process.env.NS_DISABLE_NATIVE_CLASS_TRANSFORMER = originalEnv;
		}
	});

	it('is off by default', () => {
		delete process.env.NS_DISABLE_NATIVE_CLASS_TRANSFORMER;
		expect(isNativeClassTransformerDisabled({})).toBe(false);
	});

	it('honors --env.disableNativeClassTransformer', () => {
		delete process.env.NS_DISABLE_NATIVE_CLASS_TRANSFORMER;
		expect(
			isNativeClassTransformerDisabled({
				disableNativeClassTransformer: true,
			}),
		).toBe(true);
		expect(
			isNativeClassTransformerDisabled({
				disableNativeClassTransformer: false,
			}),
		).toBe(false);
	});

	it('honors --env.disableNativeTransformer as an alias', () => {
		delete process.env.NS_DISABLE_NATIVE_CLASS_TRANSFORMER;
		expect(
			isNativeClassTransformerDisabled({
				disableNativeTransformer: true,
			}),
		).toBe(true);
	});

	it('honors NS_DISABLE_NATIVE_CLASS_TRANSFORMER', () => {
		process.env.NS_DISABLE_NATIVE_CLASS_TRANSFORMER = '1';
		expect(isNativeClassTransformerDisabled({})).toBe(true);
		process.env.NS_DISABLE_NATIVE_CLASS_TRANSFORMER = '0';
		expect(isNativeClassTransformerDisabled({})).toBe(false);
	});
});
