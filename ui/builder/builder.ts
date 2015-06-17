import view = require("ui/core/view");
import fs = require("file-system");
import xml = require("xml");
import file_access_module = require("file-system/file-system-access");
import types = require("utils/types");
import componentBuilder = require("ui/builder/component-builder");
import templateBuilderDef = require("ui/builder/template-builder");
import platform = require("platform");

var KNOWNCOLLECTIONS = "knownCollections";

function isPlatform(value: string): boolean {
    return value && (value.toLowerCase() === platform.platformNames.android.toLowerCase()
        || value.toLowerCase() === platform.platformNames.ios.toLowerCase());
}

function isCurentPlatform(value: string): boolean {
    return value && value.toLowerCase() === platform.device.os.toLowerCase();
}

export function parse(value: string, exports: any): view.View {
    var viewToReturn: view.View;

    if (exports instanceof view.View) {
        exports = getExports(exports);
    }

    var componentModule = parseInternal(value, exports);

    if (componentModule) {
        viewToReturn = componentModule.component;
    }

    return viewToReturn;
}

function parseInternal(value: string, exports: any): componentBuilder.ComponentModule {
    var rootComponentModule: componentBuilder.ComponentModule;
    // Temporary collection used for parent scope.
    var parents = new Array<componentBuilder.ComponentModule>();
    var complexProperties = new Array<ComplexProperty>();

    var templateBuilder: templateBuilderDef.TemplateBuilder;

    var currentPlatformContext: string;

    // Parse the XML.
    var xmlParser = new xml.XmlParser((args: xml.ParserEvent) => {

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
            if (args.eventType === xml.ParserEventType.StartElement) {
                templateBuilder.addStartElement(args.prefix, args.namespace, args.elementName, args.attributes);
            } else if (args.eventType === xml.ParserEventType.EndElement) {
                if (templateBuilder.elementName !== args.elementName) {
                    templateBuilder.addEndElement(args.prefix, args.elementName);
                } else {
                    templateBuilder.build();
                    templateBuilder = undefined;
                }
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
                        parent: parent,
                        name: name,
                        elementName: args.elementName,
                        templateItems: []
                    });
                }

            } else {

                var componentModule: componentBuilder.ComponentModule;

                if (args.prefix) {
                    // Custom components

                    var ns = args.namespace;

                    if (ns) {
                        var xmlPath = fs.path.join(fs.knownFolders.currentApp().path, ns, args.elementName) + ".xml";

                        if (fs.File.exists(xmlPath)) {
                            // Custom components with XML
                            var jsPath = xmlPath.replace(".xml", ".js");
                            var subExports;
                            if (fs.File.exists(jsPath)) {
                                // Custom components with XML and code
                                subExports = require(jsPath.replace(".js", ""))
                            }

                            componentModule = loadInternal(xmlPath, subExports);

                            // Attributes will be transfered to the custom component
                            if (types.isDefined(componentModule) && types.isDefined(componentModule.component)) {
                                var attr: string;
                                for (attr in args.attributes) {
                                    componentBuilder.setPropertyValue(componentModule.component, subExports, exports, attr, args.attributes[attr]);
                                }
                            }
                        } else {
                            // Custom components without XML
                            componentModule = componentBuilder.getComponentModule(args.elementName, ns, args.attributes, exports);
                        }
                    }
                } else {
                    // Default components
                    componentModule = componentBuilder.getComponentModule(args.elementName, ns, args.attributes, exports);
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
                        }
                    } else if (parents.length === 0) {
                        // Set root component.
                        rootComponentModule = componentModule;
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

    },(e) => {
            throw new Error("XML parse error: " + e.message);
        }, true);

    if (types.isString(value)) {
        value = value.replace(/xmlns=("|')http:\/\/www.nativescript.org\/tns.xsd\1/, "");
        xmlParser.parse(value);
    }

    return rootComponentModule;
}

export function load(fileName: string, exports: any): view.View {
    var viewToReturn: view.View;
    var componentModule = loadInternal(fileName, exports);

    if (componentModule) {
        viewToReturn = componentModule.component;
    }

    return viewToReturn;
}

function loadInternal(fileName: string, exports: any): componentBuilder.ComponentModule {
    var componentModule: componentBuilder.ComponentModule;

    // Check if the XML file exists.
    if (fileName && fs.File.exists(fileName)) {

        var fileAccess = new file_access_module.FileSystemAccess();

        // Read the XML file.
        fileAccess.readText(fileName, result => {
            componentModule = parseInternal(result, exports);
        },(e) => {
                throw new Error("Error loading file " + fileName + " :" + e.message);
            });
    }

    if (componentModule && componentModule.component) {
        // Save exports to root component (will be used for templates).
        (<any>componentModule.component).exports = exports;
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

function isKnownCollection(name: string, exports: any): boolean {
    return KNOWNCOLLECTIONS in exports && exports[KNOWNCOLLECTIONS] && name in exports[KNOWNCOLLECTIONS];
}

function addToComplexProperty(parent: componentBuilder.ComponentModule, complexProperty, elementModule: componentBuilder.ComponentModule) {
    // If property name is known collection we populate array with elements.
    var parentComponent = <any>parent.component;
    if (isKnownCollection(complexProperty.name, parent.exports)) {
        complexProperty.items.push(elementModule.component);
    } else if (parentComponent._addChildFromBuilder) {
        parentComponent._addChildFromBuilder("", elementModule.component);
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