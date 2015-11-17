import view = require("ui/core/view");
import fs = require("file-system");
import xml = require("xml");
import types = require("utils/types");
import componentBuilder = require("ui/builder/component-builder");
import templateBuilderDef = require("ui/builder/template-builder");
import platform = require("platform");
import definition = require("ui/builder");
import page = require("ui/page");
import fileResolverModule = require("file-system/file-name-resolver");
import trace = require("trace");
import debug = require("utils/debug");

var KNOWNCOLLECTIONS = "knownCollections";

function isPlatform(value: string): boolean {
    return value && (value.toLowerCase() === platform.platformNames.android.toLowerCase()
        || value.toLowerCase() === platform.platformNames.ios.toLowerCase());
}

function isCurentPlatform(value: string): boolean {
    return value && value.toLowerCase() === platform.device.os.toLowerCase();
}

export function parse(value: string | view.Template, context: any): view.View {
    if (types.isString(value)) {
        var viewToReturn: view.View;
    
        if (context instanceof view.View) {
            context = getExports(context);
        }
    
        var componentModule = parseInternal(<string>value, context);
    
        if (componentModule) {
            viewToReturn = componentModule.component;
        }
    
        return viewToReturn;
    } else if (types.isFunction(value)) {
        return (<view.Template>value)();
    }
}

function parseInternal(value: string, context: any, uri?: string): componentBuilder.ComponentModule {
    var currentPage: page.Page;
    var rootComponentModule: componentBuilder.ComponentModule;
    // Temporary collection used for parent scope.
    var parents = new Array<componentBuilder.ComponentModule>();
    var complexProperties = new Array<ComplexProperty>();

    var templateBuilder: templateBuilderDef.TemplateBuilder;

    var currentPlatformContext: string;
    
    var wrapSource: (e: Error, p: xml.Position) => Error;
    if (debug.debug && uri) {
        wrapSource = (e: Error, p: xml.Position) => {
            var source = new debug.Source(uri, p.line, p.column);
            e = new debug.SourceError(e, source, "Building UI from XML.");
            return e;
        }
    } else {
        wrapSource = e => e; // no-op identity
    }    

    // Parse the XML.
    var xmlParser = new xml.XmlParser((args: xml.ParserEvent) => {
        try {
            if (args.eventType === xml.ParserEventType.StartElement) {
                if (isPlatform(args.elementName)) {
    
                    if (currentPlatformContext) {
                        throw new Error("Already in '" + currentPlatformContext + "' platform context and cannot switch to '" + args.elementName + "' platform! Platform tags cannot be nested.");
                    }
    
                    currentPlatformContext = args.elementName;
                    return;
                }
            }
    
            if (args.eventType === xml.ParserEventType.EndElement) {
                if (isPlatform(args.elementName)) {
                    currentPlatformContext = undefined;
                    return;
                }
            }
    
            if (currentPlatformContext && !isCurentPlatform(currentPlatformContext)) {
                return;
            }
    
            if (templateBuilder) {
                var finished = templateBuilder.handleElement(args);
                if (finished) {
                    // Clean-up and continnue
                    templateBuilder = undefined;
                }
                else {
                    // Skip processing untill the template builder finishes his job.
                    return;
                }
            }
    
            // Get the current parent.
            var parent = parents[parents.length - 1];
            var complexProperty = complexProperties[complexProperties.length - 1];
    
            // Create component instance from every element declaration.
            if (args.eventType === xml.ParserEventType.StartElement) {
                if (isComplexProperty(args.elementName)) {
    
                    var name = getComplexProperty(args.elementName);
    
                    complexProperties.push({
                        parent: parent,
                        name: name,
                        items: [],
                    });
    
                    if (templateBuilderDef.isKnownTemplate(name, parent.exports)) {
                        templateBuilder = new templateBuilderDef.TemplateBuilder({
                            context: parent ? getExports(parent.component) : null, // Passing 'context' won't work if you set "codeFile" on the page
                            parent: parent,
                            name: name,
                            elementName: args.elementName,
                            templateItems: []
                        });
                    }
    
                } else {
    
                    var componentModule: componentBuilder.ComponentModule;
    
                    if (args.prefix && args.namespace) {
                        // Custom components
                        componentModule = loadCustomComponent(args.namespace, args.elementName, args.attributes, context, currentPage);
                    } else {
                        // Default components
                        componentModule = componentBuilder.getComponentModule(args.elementName, args.namespace, args.attributes, context);
                    }
    
                    if (componentModule) {
                        if (parent) {
                            if (componentModule.component instanceof view.View) {
                                if (complexProperty) {
                                    // Add to complex property to component.
                                    addToComplexProperty(parent, complexProperty, componentModule)
                                } else if ((<any>parent.component)._addChildFromBuilder) {
                                    // Add component to visual tree
                                    (<any>parent.component)._addChildFromBuilder(args.elementName, componentModule.component);
                                }
                            } else if (complexProperty) {
                                // Add component to complex property of parent component.
                                addToComplexProperty(parent, complexProperty, componentModule);
                            } else if ((<any>parent.component)._addChildFromBuilder) {
                                (<any>parent.component)._addChildFromBuilder(args.elementName, componentModule.component);
                            }
                        } else if (parents.length === 0) {
                            // Set root component.
                            rootComponentModule = componentModule;
    
                            if (rootComponentModule && rootComponentModule.component instanceof page.Page) {
                                currentPage = <page.Page>rootComponentModule.component;
                            }
                        }
    
                        // Add the component instance to the parents scope collection.
                        parents.push(componentModule);
                    }
                }
    
            } else if (args.eventType === xml.ParserEventType.EndElement) {
                if (isComplexProperty(args.elementName)) {
                    if (complexProperty) {
                        if (parent && (<any>parent.component)._addArrayFromBuilder) {
                            // If parent is AddArrayFromBuilder call the interface method to populate the array property.
                            (<any>parent.component)._addArrayFromBuilder(complexProperty.name, complexProperty.items);
                            complexProperty.items = [];
                        }
                    }
                    // Remove the last complexProperty from the complexProperties collection (move to the previous complexProperty scope).
                    complexProperties.pop();
    
                } else {
                    // Remove the last parent from the parents collection (move to the previous parent scope).
                    parents.pop();
                }
            }
    
        } catch(e) {
            throw wrapSource(e, args.position);
        }
    }, (e, p) => {
        throw wrapSource(new Error("XML parse error: " + e.message), p);
    }, true);

    if (types.isString(value)) {
        value = value.replace(/xmlns=("|')http:\/\/((www)|(schemas))\.nativescript\.org\/tns\.xsd\1/, "");
        xmlParser.parse(value);
    }

    return rootComponentModule;
}

function loadCustomComponent(componentPath: string, componentName?: string, attributes?: Object, context?: Object, parentPage?: page.Page): componentBuilder.ComponentModule {
    var result: componentBuilder.ComponentModule;
    componentPath = componentPath.replace("~/", "");

    var fullComponentPathFilePathWithoutExt = componentPath;

    if (!fs.File.exists(componentPath) || componentPath === "." || componentPath === "./") {
        fullComponentPathFilePathWithoutExt = fs.path.join(fs.knownFolders.currentApp().path, componentPath, componentName);
    }

    var xmlFilePath = fileResolverModule.resolveFileName(fullComponentPathFilePathWithoutExt, "xml");

    if (xmlFilePath) {
        // Custom components with XML
        var jsFilePath = fileResolverModule.resolveFileName(fullComponentPathFilePathWithoutExt, "js");

        var subExports;
        if (jsFilePath) {
            // Custom components with XML and code
            subExports = require(jsFilePath)
        }

        result = loadInternal(xmlFilePath, subExports);

        // Attributes will be transfered to the custom component
        if (types.isDefined(result) && types.isDefined(result.component) && types.isDefined(attributes)) {
            var attr: string;
            for (attr in attributes) {
                componentBuilder.setPropertyValue(result.component, subExports, context, attr, attributes[attr]);
            }
        }
    } else {
        // Custom components without XML
        result = componentBuilder.getComponentModule(componentName, componentPath, attributes, context);
    }

    // Add component CSS file if exists.
    var cssFilePath = fileResolverModule.resolveFileName(fullComponentPathFilePathWithoutExt, "css");
    if (cssFilePath) {
        if (parentPage) {
            parentPage.addCssFile(cssFilePath);
        } else {
            trace.write("CSS file found but no page specified. Please specify page in the options!", trace.categories.Error, trace.messageType.error);
        }
    }

    return result;
}

export function load(pathOrOptions: string | definition.LoadOptions, context?: any): view.View {
    var viewToReturn: view.View;
    var componentModule: componentBuilder.ComponentModule;

    if (!context) {
        if (!types.isString(pathOrOptions)) {
            let options = <definition.LoadOptions>pathOrOptions;
            componentModule = loadCustomComponent(options.path, options.name, undefined, options.exports, options.page);
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

function loadInternal(fileName: string, context?: any): componentBuilder.ComponentModule {
    var componentModule: componentBuilder.ComponentModule;

    // Check if the XML file exists.
    if (fs.File.exists(fileName)) {
        var file = fs.File.fromPath(fileName);
        var onError = function (error) {
            throw new Error("Error loading file " + fileName + " :" + error.message);
        }
        var text = file.readTextSync(onError);
        componentModule = parseInternal(text, context, fileName);
    }

    if (componentModule && componentModule.component) {
        // Save exports to root component (will be used for templates).
        (<any>componentModule.component).exports = context;
    }

    return componentModule;
}

function isComplexProperty(name: string): boolean {
    return types.isString(name) && name.indexOf(".") !== -1;
}

function getComplexProperty(fullName: string): string {
    var name: string;

    if (types.isString(fullName)) {
        var names = fullName.split(".");
        name = names[names.length - 1];
    }

    return name;
}

function isKnownCollection(name: string, context: any): boolean {
    return KNOWNCOLLECTIONS in context && context[KNOWNCOLLECTIONS] && name in context[KNOWNCOLLECTIONS];
}

function addToComplexProperty(parent: componentBuilder.ComponentModule, complexProperty: ComplexProperty, elementModule: componentBuilder.ComponentModule) {
    // If property name is known collection we populate array with elements.
    var parentComponent = <any>parent.component;
    if (isKnownCollection(complexProperty.name, parent.exports)) {
        complexProperty.items.push(elementModule.component);
    } else if (parentComponent._addChildFromBuilder) {
        parentComponent._addChildFromBuilder(complexProperty.name, elementModule.component);
    } else {
        // Or simply assign the value;
        parentComponent[complexProperty.name] = elementModule.component;
    }
}

interface ComplexProperty {
    parent: componentBuilder.ComponentModule;
    name: string;
    items?: Array<any>;
}

function getExports(instance: view.View): any {
    var parent = instance.parent;

    while (parent && (<any>parent).exports === undefined) {
        parent = parent.parent;
    }

    return parent ? (<any>parent).exports : undefined;
}
