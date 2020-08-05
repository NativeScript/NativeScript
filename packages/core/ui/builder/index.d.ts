import { View, Template, KeyedTemplate } from '../core/view';
import { Page } from '../page';
import { NavigationEntry } from '../frame';

export interface LoadOptions {
	path: string;
	name: string;
	attributes?: any;
	exports?: any;
	page?: Page;
}

/**
 * @deprecated Use Builder.createViewFromEntry() instead.
 */
export function createViewFromEntry(entry: NavigationEntry): View;

/**
 * @deprecated Use Builder.parse() instead.
 */
export function parse(value: string | Template, exports?: any): View;

/**
 * @deprecated Use Builder.parseMultipleTemplates() instead.
 */
export function parseMultipleTemplates(value: string, exports?: any): Array<KeyedTemplate>;

/**
 * @deprecated Use Builder.load() instead.
 */
export function load(fileName: string, exports?: any): View;

/**
 * @deprecated Use Builder.load() instead.
 */
export function load(options: LoadOptions): View;

export class Builder {
	/**
	 * UI plugin developers can add to these to define their own custom types if needed
	 */
	static knownTemplates: Set<string>;
	static knownMultiTemplates: Set<string>;
	static knownCollections: Set<string>;

	/**
	 * Creates view from navigation entry
	 * @param entry NavigationEntry
	 */
	static createViewFromEntry(entry: NavigationEntry): View;

	static parse(value: string | Template, exports?: any): View;

	/**
	 * Creates an array of KeyedTemplates from string
	 * @param value The xml of the template to be parsed
	 * @param exports Current context of the template
	 */
	static parseMultipleTemplates(value: string, exports?: any): Array<KeyedTemplate>;

	/**
	 * Loads component from module with context
	 * @param moduleName the module name
	 * @param exports the context of the component to be loaded
	 */
	static load(moduleName: string, exports?: any): View;

	/**
	 * Loads component from options
	 * @param options Load options
	 */
	static load(options: LoadOptions): View;
}
