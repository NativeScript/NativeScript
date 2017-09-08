// Definitions.
import { LoadOptions } from ".";
import { View, ViewBase, Template, KeyedTemplate } from "../core/view";

// Types.
import { debug, ScopeError, SourceError, Source } from "../../utils/debug";
import * as xml from "../../xml";
import { File, path, knownFolders } from "../../file-system";
import { isString, isDefined } from "../../utils/types";
import { ComponentModule, setPropertyValue, getComponentModule } from "./component-builder";
import { platformNames, device } from "../../platform";
import { resolveFileName } from "../../file-system/file-name-resolver";
import { profile } from "../../profiling";
import * as traceModule from "../../trace";

const ios = platformNames.ios.toLowerCase();
const android = platformNames.android.toLowerCase();

const defaultNameSpaceMatcher = /tns\.xsd$/i;

var trace: typeof traceModule;
function ensureTrace() {
    if (!trace) {
        trace = require("trace");
    }
}

export function parse(value: string | Template, context: any): View {
    if (typeof value === "function") {
        return (<Template>value)();
    } else {
        const exports = context ? getExports(context) : undefined;
        const componentModule = parseInternal(value, exports);
        if (componentModule) {
            return componentModule.component;
        }
        return undefined;
    }
}

export function parseMultipleTemplates(value: string, context: any): Array<KeyedTemplate> {
    let dummyComponent = `<ListView><ListView.itemTemplates>${value}</ListView.itemTemplates></ListView>`;
    return parseInternal(dummyComponent, context).component["itemTemplates"];
}

function parseInternal(value: string, context: any, uri?: string, moduleNamePath?: string): ComponentModule {
    var start: xml2ui.XmlStringParser;
    var ui: xml2ui.ComponentParser;

    var errorFormat = (debug && uri) ? xml2ui.SourceErrorFormat(uri) : xml2ui.PositionErrorFormat;
    var componentSourceTracker = (debug && uri) ? xml2ui.ComponentSourceTracker(uri) : () => {
        // no-op
    };

    (start = new xml2ui.XmlStringParser(errorFormat))
        .pipe(new xml2ui.PlatformFilter())
        .pipe(new xml2ui.XmlStateParser(ui = new xml2ui.ComponentParser(context, errorFormat, componentSourceTracker, moduleNamePath)));

    start.parse(value);

    return ui.rootComponentModule;
}

function loadCustomComponent(componentPath: string, componentName?: string, attributes?: Object, context?: Object, parentPage?: View): ComponentModule {
    if (!parentPage && context) {
        // Read the parent page that was passed down below
        // https://github.com/NativeScript/NativeScript/issues/1639
        parentPage = context["_parentPage"];
        delete context["_parentPage"];
    }
    var result: ComponentModule;
    componentPath = componentPath.replace("~/", "");
    const moduleName = componentPath + "/" + componentName;

    var fullComponentPathFilePathWithoutExt = componentPath;

    if (!File.exists(componentPath) || componentPath === "." || componentPath === "./") {
        fullComponentPathFilePathWithoutExt = path.join(knownFolders.currentApp().path, componentPath, componentName);
    }

    var xmlFilePath = resolveFileName(fullComponentPathFilePathWithoutExt, "xml");

    if (xmlFilePath) {
        // Custom components with XML
        var jsFilePath = resolveFileName(fullComponentPathFilePathWithoutExt, "js");

        var subExports = context;
        if (global.moduleExists(moduleName)) {
            // Component has registered code module.
            subExports = global.loadModule(moduleName);
        } else {
            if (jsFilePath) {
                // Component has code file.
                subExports = global.loadModule(jsFilePath)
            }
        }

        // Pass the parent page down the chain in case of custom components nested on many levels. Use the context for piggybacking.
        // https://github.com/NativeScript/NativeScript/issues/1639
        if (!subExports) {
            subExports = {};
        }
        subExports["_parentPage"] = parentPage;

        result = loadInternal(xmlFilePath, subExports);

        // Attributes will be transfered to the custom component
        if (isDefined(result) && isDefined(result.component) && isDefined(attributes)) {
            for (let attr in attributes) {
                setPropertyValue(result.component, subExports, context, attr, attributes[attr]);
            }
        }
    } else {
        // Custom components without XML
        result = getComponentModule(componentName, componentPath, attributes, context);
    }

    // Add component CSS file if exists.
    var cssFilePath = resolveFileName(fullComponentPathFilePathWithoutExt, "css");
    if (cssFilePath) {
        if (parentPage && typeof (<any>parentPage).addCssFile === "function") {
            (<any>parentPage).addCssFile(cssFilePath);
        } else {
            ensureTrace();

            trace.write("CSS file found but no page specified. Please specify page in the options!", trace.categories.Error, trace.messageType.error);
        }
    }

    return result;
}

export function load(pathOrOptions: string | LoadOptions, context?: any): View {
    var viewToReturn: View;
    var componentModule: ComponentModule;

    if (!context) {
        if (!isString(pathOrOptions)) {
            let options = <LoadOptions>pathOrOptions;
            componentModule = loadCustomComponent(options.path, options.name, options.attributes, options.exports, options.page);
        } else {
            let path = <string>pathOrOptions;
            componentModule = loadInternal(path);
        }
    } else {
        let path = <string>pathOrOptions;
        componentModule = loadInternal(path, context);
    }

    if (componentModule) {
        viewToReturn = componentModule.component;
    }

    return viewToReturn;
}

export function loadPage(moduleNamePath: string, fileName: string, context?: any): View {
    var componentModule: ComponentModule;

    // Check if the XML file exists.
    if (File.exists(fileName)) {
        const file = File.fromPath(fileName);
        const onError = function (error) {
            throw new Error("Error loading file " + fileName + " :" + error.message);
        }
        const text = file.readTextSync(onError);
        componentModule = parseInternal(text, context, fileName, moduleNamePath);
    }

    if (componentModule && componentModule.component) {
        // Save exports to root component (will be used for templates).
        (<any>componentModule.component).exports = context;
    }

    return componentModule.component;
}

function loadInternal(fileName: string, context?: any): ComponentModule {
    var componentModule: ComponentModule;

    // Check if the XML file exists.
    if (File.exists(fileName)) {
        const file = File.fromPath(fileName);
        const onError = function (error) {
            throw new Error("Error loading file " + fileName + " :" + error.message);
        }
        const text = file.readTextSync(onError);
        componentModule = parseInternal(text, context, fileName);
    }

    if (componentModule && componentModule.component) {
        // Save exports to root component (will be used for templates).
        (<any>componentModule.component).exports = context;
    }

    return componentModule;
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

        public parse(value: string) {
            var xmlParser = new xml.XmlParser((args: xml.ParserEvent) => {
                try {
                    this.next(args);
                } catch (e) {
                    throw this.error(e, args.position);
                }
            }, (e, p) => {
                throw this.error(e, p);
            }, true);

            if (isString(value)) {
                xmlParser.parse(value);
            }
        }
    }

    interface ErrorFormatter {
        (e: Error, p: xml.Position): Error;
    }

    export function PositionErrorFormat(e: Error, p: xml.Position): Error {
        return new ScopeError(e, "Parsing XML at " + p.line + ":" + p.column);
    }

    export function SourceErrorFormat(uri): ErrorFormatter {
        return (e: Error, p: xml.Position) => {
            var source = p ? new Source(uri, p.line, p.column) : new Source(uri, -1, -1);
            e = new SourceError(e, source, "Building UI from XML.");
            return e;
        }
    }

    interface SourceTracker {
        (component: any, p: xml.Position): void;
    }

    export function ComponentSourceTracker(uri): SourceTracker {
        return (component: any, p: xml.Position) => {
            if (!Source.get(component)) {
                var source = p ? new Source(uri, p.line, p.column) : new Source(uri, -1, -1);
                Source.set(component, source);
            }
        }
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
            return value && value.toLowerCase() === device.os.toLowerCase();
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
                throw new Error("Template must have exactly one root element but multiple elements were found.");
            }

            this._nestingLevel++;
        }

        private parseEndElement(prefix: string, elementName: string) {
            if (this._state === TemplateParser.State.EXPECTING_START) {
                throw new Error("Template must have exactly one root element but none was found.");
            } else if (this._state === TemplateParser.State.FINISHED) {
                throw new Error("No more closing elements expected for this template.");
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
            var context = this._context;
            var errorFormat = this._templateProperty.errorFormat;
            var sourceTracker = this._templateProperty.sourceTracker;
            var template: Template = profile("Template()", () => {
                var start: xml2ui.XmlArgsReplay;
                var ui: xml2ui.ComponentParser;

                (start = new xml2ui.XmlArgsReplay(this._recordedXmlStream, errorFormat))
                    // No platform filter, it has been filtered already
                    .pipe(new XmlStateParser(ui = new ComponentParser(context, errorFormat, sourceTracker)));

                start.replay();

                return ui.rootComponentModule.component;
            });
            return template;
        }
    }

    export class MultiTemplateParser implements XmlStateConsumer {
        private _childParsers = new Array<TemplateParser>();
        private _value: KeyedTemplate[];

        get value(): KeyedTemplate[] { return this._value; }

        constructor(private parent: XmlStateConsumer, private templateProperty: TemplateProperty) {
        }

        public parse(args: xml.ParserEvent): XmlStateConsumer {
            if (args.eventType === xml.ParserEventType.StartElement && args.elementName === "template") {
                let childParser = new TemplateParser(this, this.templateProperty, false);
                childParser["key"] = args.attributes["key"];
                this._childParsers.push(childParser);
                return childParser;
            }

            if (args.eventType === xml.ParserEventType.EndElement) {
                let name = ComponentParser.getComplexPropertyName(args.elementName);
                if (name === this.templateProperty.name) {
                    let templates = new Array<KeyedTemplate>();
                    for (let i = 0; i < this._childParsers.length; i++) {
                        templates.push({
                            key: this._childParsers[i]["key"],
                            createView: this._childParsers[i].buildTemplate()
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
            FINISHED
        }
    }

    export class ComponentParser implements XmlStateConsumer {

        private static KNOWNCOLLECTIONS = "knownCollections";
        private static KNOWNTEMPLATES = "knownTemplates";
        private static KNOWNMULTITEMPLATES = "knownMultiTemplates";

        public rootComponentModule: ComponentModule;

        private context: any;

        private currentRootView: View;
        private parents = new Array<ComponentModule>();
        private complexProperties = new Array<ComponentParser.ComplexProperty>();

        private error: ErrorFormatter;
        private sourceTracker: SourceTracker;

        constructor(context: any, errorFormat: ErrorFormatter, sourceTracker: SourceTracker, private moduleNamePath?: string) {
            this.context = context;
            this.error = errorFormat;
            this.sourceTracker = sourceTracker;
        }

        @profile
        private buildComponent(args: xml.ParserEvent): ComponentModule {
            if (args.prefix && args.namespace) {
                // Custom components
                return loadCustomComponent(args.namespace, args.elementName, args.attributes, this.context, this.currentRootView);
            } else {
                // Default components
                let namespace = args.namespace;
                if (defaultNameSpaceMatcher.test(namespace || '')) {
                    //Ignore the default ...tns.xsd namespace URL
                    namespace = undefined;
                }
                return getComponentModule(args.elementName, namespace, args.attributes, this.context, this.moduleNamePath);
            }
        }

        public parse(args: xml.ParserEvent): XmlStateConsumer {

            // Get the current parent.
            var parent = this.parents[this.parents.length - 1];
            var complexProperty = this.complexProperties[this.complexProperties.length - 1];

            // Create component instance from every element declaration.
            if (args.eventType === xml.ParserEventType.StartElement) {
                if (ComponentParser.isComplexProperty(args.elementName)) {

                    var name = ComponentParser.getComplexPropertyName(args.elementName);

                    const complexProperty: ComponentParser.ComplexProperty = {
                        parent: parent,
                        name: name,
                        items: []
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
                            sourceTracker: this.sourceTracker
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
                            sourceTracker: this.sourceTracker
                        });
                        complexProperty.parser = parser;
                        return parser;
                    }

                } else {

                    var componentModule = this.buildComponent(args);

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
            return isString(name) && name.indexOf(".") !== -1;
        }

        public static getComplexPropertyName(fullName: string): string {
            var name: string;

            if (isString(fullName)) {
                var names = fullName.split(".");
                name = names[names.length - 1];
            }

            return name;
        }

        private static isKnownTemplate(name: string, exports: any): boolean {
            return ComponentParser.KNOWNTEMPLATES in exports && exports[ComponentParser.KNOWNTEMPLATES] && name in exports[ComponentParser.KNOWNTEMPLATES];
        }

        private static isKnownMultiTemplate(name: string, exports: any): boolean {
            return ComponentParser.KNOWNMULTITEMPLATES in exports && exports[ComponentParser.KNOWNMULTITEMPLATES] && name in exports[ComponentParser.KNOWNMULTITEMPLATES];
        }

        private static addToComplexProperty(parent: ComponentModule, complexProperty: ComponentParser.ComplexProperty, elementModule: ComponentModule) {
            // If property name is known collection we populate array with elements.
            var parentComponent = <any>parent.component;
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
            return ComponentParser.KNOWNCOLLECTIONS in context && context[ComponentParser.KNOWNCOLLECTIONS] && name in context[ComponentParser.KNOWNCOLLECTIONS];
        }
    }

    export namespace ComponentParser {
        export interface ComplexProperty {
            parent: ComponentModule;
            name: string;
            items?: Array<any>;
            parser?: { value: any; };
        }
    }
}
