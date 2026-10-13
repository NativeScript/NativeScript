import { describe, expect, it } from 'vitest';
import { quoteBindingNames } from './sbg-class-names.js';

describe('quoteBindingNames', () => {
	it('requotes the class name of a minified extend call', () => {
		expect(quoteBindingNames('androidx.appcompat.app.AppCompatActivity.extend(`com.tns.NativeScriptActivity`,{init(){}})')).toBe('androidx.appcompat.app.AppCompatActivity.extend("com.tns.NativeScriptActivity",{init(){}})');
	});

	it('requotes a JavaProxy name', () => {
		expect(quoteBindingNames('e=[JavaProxy(`org.nativescript.NativeScriptLifecycleCallbacks`)]')).toBe('e=[JavaProxy("org.nativescript.NativeScriptLifecycleCallbacks")]');
	});

	it('keeps the length, so source maps stay valid', () => {
		const code = 't.extend(`com.tns.FragmentClass`,{})';
		expect(quoteBindingNames(code)).toHaveLength(code.length);
	});

	it('accepts a bare dollar in a nested class name', () => {
		expect(quoteBindingNames('t.extend(`com.example.Outer$Inner`,{})')).toBe('t.extend("com.example.Outer$Inner",{})');
	});

	it('leaves templates with substitutions, other strings and anonymous extends alone', () => {
		const code = 'a.extend(`com.${n}.X`,{});b.extend({run(){}});c(`com.tns.Other`);d.extend("com.tns.Quoted",{})';
		expect(quoteBindingNames(code)).toBe(code);
	});
});
