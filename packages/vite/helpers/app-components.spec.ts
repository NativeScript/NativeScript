import { describe, expect, it } from 'vitest';
import { isApplicationComponent } from './app-components.js';

describe('isApplicationComponent', () => {
	it('recognizes a class extending android.app.Application or MultiDexApplication', () => {
		expect(isApplicationComponent("@NativeClass()\n@JavaProxy('org.example.Application')\nclass Application extends android.app.Application {}")).toBe(true);
		expect(isApplicationComponent('class App extends androidx.multidex.MultiDexApplication {}')).toBe(true);
		expect(isApplicationComponent("const App = android.app.Application.extend('org.example.Application', {});")).toBe(true);
	});

	it('leaves activities alone, even ones that mention the Application type', () => {
		expect(isApplicationComponent('class MainActivity extends androidx.appcompat.app.AppCompatActivity {\n\tapp(): android.app.Application {\n\t\treturn this.getApplication();\n\t}\n}')).toBe(false);
		expect(isApplicationComponent("androidx.appcompat.app.AppCompatActivity.extend('org.example.MainActivity', {});")).toBe(false);
	});
});
