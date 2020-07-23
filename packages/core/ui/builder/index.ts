// Definitions.
import { View, Template, KeyedTemplate } from '../core/view';
import { ViewBase } from '../core/view-base';
import { ViewEntry } from '../frame';
import { Page } from '../page';

// Types.
import { debug, ScopeError, SourceError, Source } from '../../utils/debug';
import * as xml from '../../xml';
import { isString, isObject, isDefined } from '../../utils/types';
import { setPropertyValue, getComponentModule } from './component-builder';
import type { ComponentModule } from './component-builder';
import { platformNames, Device } from '../../platform';
import { profile } from '../../profiling';
import { sanitizeModuleName } from './module-name-sanitizer';
import { resolveModuleName } from '../../module-name-resolver';

const ios = platformNames.ios.toLowerCase();
const android = platformNames.android.toLowerCase();
const defaultNameSpaceMatcher = /tns\.xsd$/i;

export interface LoadOptions {
	path: string;
	name: string;
	attributes?: any;
	exports?: any;
	page?: Page;
}

export class Builder {
	// ui plugin developers can add to these to define their own custom types if needed
	static knownTemplates: Set<string> = new Set(['itemTemplate']);
	static knownMultiTemplates: Set<string> = new Set(['itemTemplates']);
	static knownCollections: Set<string> = new Set(['items', 'spans', 'actionItems']);

	static createViewFromEntry(entry: ViewEntry): View {
		if (entry.create) {
			const view = entry.create();
			if (!view) {
				throw new Error('Failed to create View with entry.create() function.');
			}

			return view;
		} else if (entry.moduleName) {
			const moduleName = sanitizeModuleName(entry.moduleName);
			const resolvedCodeModuleName = resolveModuleName(moduleName, ''); //`${moduleName}.xml`;
			let moduleExports = resolvedCodeModuleName ? global.loadModule(resolvedCodeModuleName, true) : null;

			if (moduleExports && moduleExports.createPage) {
				// Exports has a createPage() method
				const view = moduleExports.createPage();
				const resolvedCssModuleName = resolveModuleName(moduleName, 'css'); //entry.moduleName + ".css";
				if (resolvedCssModuleName) {
					view.addCssFile(resolvedCssModuleName);
				}

				return view;
			} else {
				const componentModule = loadInternal(moduleName, moduleExports);
				const componentView = componentModule && componentModule.component;

				return componentView;
			}
		}

		throw new Error('Failed to load page XML file for module: ' + entry.moduleName);
	}

	static parse(value: string | Template, context?: any): View {
		if (typeof value === 'function') {
			return (<Template>value)();
		} else {
			const exports = context ? getExports(context) : undefined;
			const componentModule = parseInternal(value, exports);

			return componentModule && componentModule.component;
		}
	}

	static load(pathOrOptions: string | LoadOptions, context?: any): View {
		let componentModule: ComponentModule;

		if (typeof pathOrOptions === 'string') {
			const moduleName = sanitizeModuleName(pathOrOptions);
			componentModule = loadInternal(moduleName, context);
		} else {
			componentModule = loadCustomComponent(pathOrOptions.path, pathOrOptions.name, pathOrOptions.attributes, pathOrOptions.exports, pathOrOptions.page, true);
		}

		return componentModule && componentModule.component;
	}

	static parseMultipleTemplates(value: string, context: any): Array<KeyedTemplate> {
		const dummyComponent = `<ListView><ListView.itemTemplates>${value}</ListView.itemTemplates></ListView>`;

		return parseInternal(dummyComponent, context).component['itemTemplates'];
	}
}

export function parse(value: string | Template, context?: any): View {
	console.log('parse() is deprecated. Use Builder.parse() instead.');

	return Builder.parse(value, context);
}

export function parseMultipleTemplates(value: string, context: any): Array<KeyedTemplate> {
	console.log('parseMultipleTemplates() is deprecated. Use Builder.parseMultipleTemplates() instead.');

	return Builder.parseMultipleTemplates(value, context);
}

export function load(pathOrOptions: string | LoadOptions, context?: any): View {
	console.log('load() is deprecated. Use Builder.load() instead.');

	return Builder.load(pathOrOptions, context);
}

export function createViewFromEntry(entry: ViewEntry): View {
	console.log('createViewFromEntry() is deprecated. Use Builder.createViewFromEntry() instead.');

	return Builder.createViewFromEntry(entry);
}

function loadInternal(moduleName: string, moduleExports: any): ComponentModule {
	let componentModule: ComponentModule;

	const resolvedXmlModule = resolveModuleName(moduleName, 'xml');

	if (resolvedXmlModule) {
		const text = global.loadModule(resolvedXmlModule, true);
		componentModule = parseInternal(text, moduleExports, resolvedXmlModule, moduleName);
	}

	const componentView = componentModule && componentModule.component;
	if (componentView) {
		// Save exports to root component (will be used for templates).
		(<any>componentView).exports = moduleExports;

		// Save _moduleName - used for livesync
		componentView._moduleName = moduleName;
	}

	if (!componentModule) {
		throw new Error('Failed to load component from module: ' + moduleName);
	}

	return componentModule;
}

function loadCustomComponent(componentNamespace: string, componentName?: string, attributes?: Object, context?: Object, parentPage?: View, isRootComponent: boolean = true, moduleNamePath?: string): ComponentModule {
	if (!parentPage && context) {
		// Read the parent page that was passed down below
		// https://github.com/NativeScript/NativeScript/issues/1639
		parentPage = context['_parentPage'];
		delete context['_parentPage'];
	}

	let result: ComponentModule;

	componentNamespace = sanitizeModuleName(componentNamespace);
	const moduleName = `${componentNamespace}/${componentName}`;
	const resolvedCodeModuleName = resolveModuleName(moduleName, '');
	const resolvedXmlModuleName = resolveModuleName(moduleName, 'xml');
	let resolvedCssModuleName = resolveModuleName(moduleName, 'css');

	if (resolvedXmlModuleName) {
		// Custom components with XML
		let subExports = context;
		if (resolvedCodeModuleName) {
			// Component has registered code module.
			subExports = global.loadModule(resolvedCodeModuleName, true);
		}

		// Pass the parent page down the chain in case of custom components nested on many levels. Use the context for piggybacking.
		// https://github.com/NativeScript/NativeScript/issues/1639
		if (!subExports) {
			subExports = {};
		}

		subExports['_parentPage'] = parentPage;

		result = loadInternal(moduleName, subExports);

		// Attributes will be transferred to the custom component
		if (isDefined(result) && isDefined(result.component) && isDefined(attributes)) {
			for (let attr in attributes) {
				setPropertyValue(result.component, subExports, context, attr, attributes[attr]);
			}
		}
	} else {
		// Custom components without XML
		result = getComponentModule(componentName, componentNamespace, attributes, context, moduleNamePath, isRootComponent);

		// The namespace is the JS module and the (componentName is the name of the class in the module)
		// So if there is no componentNamespace/componentName.{qualifiers}.css we should also look for
		// componentNamespace.{qualifiers}.css
		if (!resolvedCssModuleName) {
			resolvedCssModuleName = resolveModuleName(componentNamespace, 'css');
		}
	}

	// Add CSS from webpack module if exists.
	if (parentPage && resolvedCssModuleName) {
		parentPage.addCssFile(resolvedCssModuleName);
	}

	return result;
}

function getExports(instance: ViewBase): any {
	const isView = !!instance._domId;
	if (!isView) {
		return (<any>instance).exports || instance;
	}

	let exportObject = (<any>instance).exports;
	let parent = instance.parent;
	while (exportObject === undefined && parent) {
		exportObject = (<any>parent).exports;
		parent = parent.parent;
	}

	return exportObject;
}

function parseInternal(value: string, context: any, xmlModule?: string, moduleName?: string): ComponentModule {
	let start: xml2ui.XmlStringParser;
	let ui: xml2ui.ComponentParser;

	const errorFormat = debug && xmlModule ? xml2ui.SourceErrorFormat(xmlModule) : xml2ui.PositionErrorFormat;
	const componentSourceTracker =
		debug && xmlModule
			? xml2ui.ComponentSourceTracker(xmlModule)
			: () => {
					// no-op
			  };

	(start = new xml2ui.XmlStringParser(errorFormat)).pipe(new xml2ui.PlatformFilter()).pipe(new xml2ui.XmlStateParser((ui = new xml2ui.ComponentParser(context, errorFormat, componentSourceTracker, moduleName))));

	start.parse(value);

	return ui.rootComponentModule;
}

namespace xml2ui {
	/**
	 * Pipes and filters:
	 * https://en.wikipedia.org/wiki/Pipeline_(software)
	 */
	interface XmlProducer {
		pipe<Next extends XmlConsumer>(next: Next): Next;
	}

	interface XmlConsumer {
		parse(args: xml.ParserEvent);
	}

	interface ParseInputData extends String {
		default?: string;
	}

	export class XmlProducerBase implements XmlProducer {
		private _next: XmlConsumer;
		public pipe<Next extends XmlConsumer>(next: Next) {
			this._next = next;

			return next;
		}
		protected next(args: xml.ParserEvent) {
			this._next.parse(args);
		}
	}

	export class XmlStringParser extends XmlProducerBase implements XmlProducer {
		private error: ErrorFormatter;

		constructor(error?: ErrorFormatter) {
			super();
			this.error = error || PositionErrorFormat;
		}

		public parse(value: ParseInputData) {
			const xmlParser = new xml.XmlParser(
				(args: xml.ParserEvent) => {
					try {
						this.next(args);
					} catch (e) {
						throw this.error(e, args.position);
					}
				},
				(e, p) => {
					throw this.error(e, p);
				},
				true
			);

			if (isString(value)) {
				xmlParser.parse(<string>value);
			} else if (isObject(value) && isString(value.default)) {
				xmlParser.parse(value.default);
			}
		}
	}

	interface ErrorFormatter {
		(e: Error, p: xml.Position): Error;
	}

	export function PositionErrorFormat(e: Error, p: xml.Position): Error {
		return new ScopeError(e, 'Parsing XML at ' + p.line + ':' + p.column);
	}

	export function SourceErrorFormat(uri): ErrorFormatter {
		return (e: Error, p: xml.Position) => {
			const source = p ? new Source(uri, p.line, p.column) : new Source(uri, -1, -1);
			e = new SourceError(e, source, 'Building UI from XML.');

			return e;
		};
	}

	interface SourceTracker {
		(component: any, p: xml.Position): void;
	}

	export function ComponentSourceTracker(uri): SourceTracker {
		return (component: any, p: xml.Position) => {
			if (!Source.get(component)) {
				const source = p ? new Source(uri, p.line, p.column) : new Source(uri, -1, -1);
				Source.set(component, source);
			}
		};
	}

	export class PlatformFilter extends XmlProducerBase implements XmlProducer, XmlConsumer {
		private currentPlatformContext: string;

		public parse(args: xml.ParserEvent) {
			if (args.eventType === xml.ParserEventType.StartElement) {
				if (PlatformFilter.isPlatform(args.elementName)) {
					if (this.currentPlatformContext) {
						throw new Error("Already in '" + this.currentPlatformContext + "' platform context and cannot switch to '" + args.elementName + "' platform! Platform tags cannot be nested.");
					}

					this.currentPlatformContext = args.elementName;

					return;
				}
			}

			if (args.eventType === xml.ParserEventType.EndElement) {
				if (PlatformFilter.isPlatform(args.elementName)) {
					this.currentPlatformContext = undefined;

					return;
				}
			}

			if (this.currentPlatformContext && !PlatformFilter.isCurentPlatform(this.currentPlatformContext)) {
				return;
			}

			this.next(args);
		}

		private static isPlatform(value: string): boolean {
			if (value) {
				const toLower = value.toLowerCase();

				return toLower === android || toLower === ios;
			}

			return false;
		}

		private static isCurentPlatform(value: string): boolean {
			return value && value.toLowerCase() === Device.os.toLowerCase();
		}
	}

	export class XmlArgsReplay extends XmlProducerBase implements XmlProducer {
		private error: ErrorFormatter;
		private args: xml.ParserEvent[];

		constructor(args: xml.ParserEvent[], errorFormat: ErrorFormatter) {
			super();
			this.args = args;
			this.error = errorFormat;
		}

		public replay() {
			this.args.forEach((args: xml.ParserEvent) => {
				try {
					this.next(args);
				} catch (e) {
					throw this.error(e, args.position);
				}
			});
		}
	}

	interface TemplateProperty {
		context?: any;
		parent: ComponentModule;
		name: string;
		elementName: string;
		templateItems: Array<string>;
		errorFormat: ErrorFormatter;
		sourceTracker: SourceTracker;
	}

	/**
	 * It is a state pattern
	 * https://en.wikipedia.org/wiki/State_pattern
	 */
	export class XmlStateParser implements XmlConsumer {
		private state: XmlStateConsumer;

		constructor(state: XmlStateConsumer) {
			this.state = state;
		}

		parse(args: xml.ParserEvent) {
			this.state = this.state.parse(args);
		}
	}

	interface XmlStateConsumer extends XmlConsumer {
		parse(args: xml.ParserEvent): XmlStateConsumer;
	}

	export class TemplateParser implements XmlStateConsumer {
		private _context: any;
		private _recordedXmlStream: Array<xml.ParserEvent>;
		private _templateProperty: TemplateProperty;
		private _nestingLevel: number;
		private _state: TemplateParser.State;

		private parent: XmlStateConsumer;
		private _setTemplateProperty: boolean;

		constructor(parent: XmlStateConsumer, templateProperty: TemplateProperty, setTemplateProperty = true) {
			this.parent = parent;

			this._context = templateProperty.context;
			this._recordedXmlStream = new Array<xml.ParserEvent>();
			this._templateProperty = templateProperty;
			this._nestingLevel = 0;
			this._state = TemplateParser.State.EXPECTING_START;
			this._setTemplateProperty = setTemplateProperty;
		}

		public parse(args: xml.ParserEvent): XmlStateConsumer {
			if (args.eventType === xml.ParserEventType.StartElement) {
				this.parseStartElement(args.prefix, args.namespace, args.elementName, args.attributes);
			} else if (args.eventType === xml.ParserEventType.EndElement) {
				this.parseEndElement(args.prefix, args.elementName);
			}

			this._recordedXmlStream.push(args);

			return this._state === TemplateParser.State.FINISHED ? this.parent : this;
		}

		public get elementName(): string {
			return this._templateProperty.elementName;
		}

		private parseStartElement(prefix: string, namespace: string, elementName: string, attributes: Object) {
			if (this._state === TemplateParser.State.EXPECTING_START) {
				this._state = TemplateParser.State.PARSING;
			} else if (this._state === TemplateParser.State.FINISHED) {
				throw new Error('Template must have exactly one root element but multiple elements were found.');
			}

			this._nestingLevel++;
		}

		private parseEndElement(prefix: string, elementName: string) {
			if (this._state === TemplateParser.State.EXPECTING_START) {
				throw new Error('Template must have exactly one root element but none was found.');
			} else if (this._state === TemplateParser.State.FINISHED) {
				throw new Error('No more closing elements expected for this template.');
			}

			this._nestingLevel--;

			if (this._nestingLevel === 0) {
				this._state = TemplateParser.State.FINISHED;

				if (this._setTemplateProperty && this._templateProperty.name in this._templateProperty.parent.component) {
					let template = this.buildTemplate();
					this._templateProperty.parent.component[this._templateProperty.name] = template;
				}
			}
		}

		public buildTemplate(): Template {
			const context = this._context;
			const errorFormat = this._templateProperty.errorFormat;
			const sourceTracker = this._templateProperty.sourceTracker;
			const template: Template = <Template>profile('Template()', () => {
				let start: xml2ui.XmlArgsReplay;
				let ui: xml2ui.ComponentParser;

				(start = new xml2ui.XmlArgsReplay(this._recordedXmlStream, errorFormat))
					// No platform filter, it has been filtered already
					.pipe(new XmlStateParser((ui = new ComponentParser(context, errorFormat, sourceTracker))));

				start.replay();

				return ui.rootComponentModule.component;
			});

			return template;
		}
	}

	export class MultiTemplateParser implements XmlStateConsumer {
		private _childParsers = new Array<TemplateParser>();
		private _value: KeyedTemplate[];

		get value(): KeyedTemplate[] {
			return this._value;
		}

		constructor(private parent: XmlStateConsumer, private templateProperty: TemplateProperty) {}

		public parse(args: xml.ParserEvent): XmlStateConsumer {
			if (args.eventType === xml.ParserEventType.StartElement && args.elementName === 'template') {
				let childParser = new TemplateParser(this, this.templateProperty, false);
				childParser['key'] = args.attributes['key'];
				this._childParsers.push(childParser);

				return childParser;
			}

			if (args.eventType === xml.ParserEventType.EndElement) {
				let name = ComponentParser.getComplexPropertyName(args.elementName);
				if (name === this.templateProperty.name) {
					let templates = new Array<KeyedTemplate>();
					for (let i = 0; i < this._childParsers.length; i++) {
						templates.push({
							key: this._childParsers[i]['key'],
							createView: this._childParsers[i].buildTemplate(),
						});
					}
					this._value = templates;

					return this.parent.parse(args);
				}
			}

			return this;
		}
	}

	export namespace TemplateParser {
		export const enum State {
			EXPECTING_START,
			PARSING,
			FINISHED,
		}
	}

	export class ComponentParser implements XmlStateConsumer {
		private static KNOWNCOLLECTIONS = 'knownCollections';
		private static KNOWNTEMPLATES = 'knownTemplates';
		private static KNOWNMULTITEMPLATES = 'knownMultiTemplates';

		public rootComponentModule: ComponentModule;

		private context: any;

		private currentRootView: View;
		private parents = new Array<ComponentModule>();
		private complexProperties = new Array<ComponentParser.ComplexProperty>();

		private error: ErrorFormatter;
		private sourceTracker: SourceTracker;

		constructor(context: any, errorFormat: ErrorFormatter, sourceTracker: SourceTracker, private moduleName?: string) {
			this.context = context;
			this.error = errorFormat;
			this.sourceTracker = sourceTracker;
		}

		@profile
		private buildComponent(args: xml.ParserEvent): ComponentModule {
			if (args.prefix && args.namespace) {
				// Custom components
				return loadCustomComponent(args.namespace, args.elementName, args.attributes, this.context, this.currentRootView, !this.currentRootView, this.moduleName);
			} else {
				// Default components
				let namespace = args.namespace;
				if (defaultNameSpaceMatcher.test(namespace || '')) {
					//Ignore the default ...tns.xsd namespace URL
					namespace = undefined;
				}

				return getComponentModule(args.elementName, namespace, args.attributes, this.context, this.moduleName, !this.currentRootView);
			}
		}

		public parse(args: xml.ParserEvent): XmlStateConsumer {
			// Get the current parent.
			const parent = this.parents[this.parents.length - 1];
			const complexProperty = this.complexProperties[this.complexProperties.length - 1];

			// Create component instance from every element declaration.
			if (args.eventType === xml.ParserEventType.StartElement) {
				if (ComponentParser.isComplexProperty(args.elementName)) {
					const name = ComponentParser.getComplexPropertyName(args.elementName);

					const complexProperty: ComponentParser.ComplexProperty = {
						parent: parent,
						name: name,
						items: [],
					};
					this.complexProperties.push(complexProperty);

					if (ComponentParser.isKnownTemplate(name, parent.exports)) {
						return new TemplateParser(this, {
							context: (parent ? getExports(parent.component) : null) || this.context, // Passing 'context' won't work if you set "codeFile" on the page
							parent: parent,
							name: name,
							elementName: args.elementName,
							templateItems: [],
							errorFormat: this.error,
							sourceTracker: this.sourceTracker,
						});
					}

					if (ComponentParser.isKnownMultiTemplate(name, parent.exports)) {
						const parser = new MultiTemplateParser(this, {
							context: (parent ? getExports(parent.component) : null) || this.context, // Passing 'context' won't work if you set "codeFile" on the page
							parent: parent,
							name: name,
							elementName: args.elementName,
							templateItems: [],
							errorFormat: this.error,
							sourceTracker: this.sourceTracker,
						});
						complexProperty.parser = parser;

						return parser;
					}
				} else {
					const componentModule = this.buildComponent(args);

					if (componentModule) {
						this.sourceTracker(componentModule.component, args.position);
						if (parent) {
							if (complexProperty) {
								// Add component to complex property of parent component.
								ComponentParser.addToComplexProperty(parent, complexProperty, componentModule);
							} else if ((<any>parent.component)._addChildFromBuilder) {
								(<any>parent.component)._addChildFromBuilder(args.elementName, componentModule.component);
							}
						} else if (this.parents.length === 0) {
							// Set root component.
							this.rootComponentModule = componentModule;

							if (this.rootComponentModule) {
								this.currentRootView = this.rootComponentModule.component;

								if ((<any>this.currentRootView).exports) {
									this.context = (<any>this.currentRootView).exports;
								}
							}
						}

						// Add the component instance to the parents scope collection.
						this.parents.push(componentModule);
					}
				}
			} else if (args.eventType === xml.ParserEventType.EndElement) {
				if (ComponentParser.isComplexProperty(args.elementName)) {
					if (complexProperty) {
						if (complexProperty.parser) {
							parent.component[complexProperty.name] = complexProperty.parser.value;
						} else if (parent && (<any>parent.component)._addArrayFromBuilder) {
							// If parent is AddArrayFromBuilder call the interface method to populate the array property.
							(<any>parent.component)._addArrayFromBuilder(complexProperty.name, complexProperty.items);
							complexProperty.items = [];
						}
					}
					// Remove the last complexProperty from the complexProperties collection (move to the previous complexProperty scope).
					this.complexProperties.pop();
				} else {
					// Remove the last parent from the parents collection (move to the previous parent scope).
					this.parents.pop();
				}
			}

			return this;
		}

		private static isComplexProperty(name: string): boolean {
			return isString(name) && name.indexOf('.') !== -1;
		}

		public static getComplexPropertyName(fullName: string): string {
			let name: string;

			if (isString(fullName)) {
				const names = fullName.split('.');
				name = names[names.length - 1];
			}

			return name;
		}

		private static isKnownTemplate(name: string, exports: any): boolean {
			return Builder.knownTemplates.has(name);
		}

		private static isKnownMultiTemplate(name: string, exports: any): boolean {
			return Builder.knownMultiTemplates.has(name);
		}

		private static addToComplexProperty(parent: ComponentModule, complexProperty: ComponentParser.ComplexProperty, elementModule: ComponentModule) {
			// If property name is known collection we populate array with elements.
			const parentComponent = <any>parent.component;
			if (ComponentParser.isKnownCollection(complexProperty.name, parent.exports)) {
				complexProperty.items.push(elementModule.component);
			} else if (parentComponent._addChildFromBuilder) {
				parentComponent._addChildFromBuilder(complexProperty.name, elementModule.component);
			} else {
				// Or simply assign the value;
				parentComponent[complexProperty.name] = elementModule.component;
			}
		}

		private static isKnownCollection(name: string, context: any): boolean {
			return Builder.knownCollections.has(name);
		}
	}

	export namespace ComponentParser {
		export interface ComplexProperty {
			parent: ComponentModule;
			name: string;
			items?: Array<any>;
			parser?: { value: any };
		}
	}
}
