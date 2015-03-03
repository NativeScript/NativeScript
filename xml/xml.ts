import definition = require("xml");
import easysax = require("js-libs/easysax");

export class ParserEventType implements definition.ParserEventType {
    static StartElement = "StartElement";
    static EndElement = "EndElement";
    static Text = "Text";
    static CDATA = "CDATA";
    static Comment = "Comment";
}

export class ParserEvent implements definition.ParserEvent {
    private _eventType: string;
    private _prefix: string;
    private _namespace: string;
    private _elementName: string;
    private _attributes: Object;
    private _data: string;

    constructor(eventType: string, prefix?: string, namespace?: string, elementName?: string, attributes?: Object, data?: string) {
        this._eventType = eventType;
        this._prefix = prefix;
        this._namespace = namespace;
        this._elementName = elementName;
        this._attributes = attributes;
        this._data = data;
    }

    public toString(): string {
        return JSON.stringify({
            eventType: this.eventType,
            prefix: this.prefix,
            namespace: this.namespace,
            elementName: this.elementName,
            attributes: this.attributes,
            data: this.data
        });
    }

    public get eventType(): string {
        return this._eventType;
    }

    public get prefix(): string {
        return this._prefix;
    }

    public get namespace(): string {
        return this._namespace;
    }

    public get elementName(): string {
        return this._elementName;
    }

    public get attributes(): Object {
        return this._attributes;
    }

    public get data(): string {
        return this._data;
    }
}

export class XmlParser implements definition.XmlParser {
    //TODO: Add option to configure whether the parser should report ignorable whitespace, i.e. document formatting whitespace.
    private _parser: easysax.EasySAXParser;

    private _processNamespaces: boolean;
    private _namespaceStack: Array<any>;

    constructor(onEvent: (event: definition.ParserEvent) => void, onError?: (error: Error) => void, processNamespaces?: boolean) {
        this._processNamespaces = processNamespaces;
        this._parser = new easysax.EasySAXParser();

        var that = this;
        this._parser.on('startNode', function (elem, attr, uq, str, tagend) {
            var attributes = attr();

            if (attributes === true) {//HACK: For some reason easysax returns the true literal when an element has no attributes.
                attributes = undefined;
            }

            if (attributes) {
                var key;
                for (key in attributes) {
                    if (attributes.hasOwnProperty(key)) {
                        // Convert entities such as &gt; to >
                        attributes[key] = XmlParser._dereferenceEntities(attributes[key]);
                    }
                }
            }

            var prefix = undefined;
            var namespace = undefined;
            var name = elem;

            if (that._processNamespaces) {
                var stackEntry = XmlParser._getNamespacesStackEntry(attributes);    
                that._namespaceStack.push(stackEntry);

                var resolved = that._resolveNamespace(name);
                prefix = resolved.prefix;
                namespace = resolved.namespace;
                name = resolved.name;
            }

            onEvent(new ParserEvent(ParserEventType.StartElement, prefix, namespace, name, attributes, undefined));
        });

        this._parser.on('textNode', function (text, uq) {
            var data = uq(text);// Decode entity references such as &lt; and &gt;
            onEvent(new ParserEvent(ParserEventType.Text, undefined, undefined, undefined, undefined, data));
        });

        this._parser.on('endNode', function (elem, uq, tagstart, str) {

            var prefix = undefined;
            var namespace = undefined;
            var name = elem;

            if (that._processNamespaces) {
                var resolved = that._resolveNamespace(name);
                prefix = resolved.prefix;
                namespace = resolved.namespace;
                name = resolved.name;
            }

            onEvent(new ParserEvent(ParserEventType.EndElement, prefix, namespace, name, undefined, undefined));

            if (that._processNamespaces) {
                that._namespaceStack.pop();
            }
        });

        this._parser.on('cdata', function (data) {
            onEvent(new ParserEvent(ParserEventType.CDATA, undefined, undefined, undefined, undefined, data));
        });

        this._parser.on('comment', function (text) {
            onEvent(new ParserEvent(ParserEventType.Comment, undefined, undefined, undefined, undefined, text));
        });

        if (onError) {
            this._parser.on('error', function (msg) {
                onError(new Error(msg));
            });
        }
    }

    public parse(xmlString: string): void {
        if (this._processNamespaces) {
            this._namespaceStack = [];
        }

        this._parser.parse(xmlString);
    }

    private static _getNamespacesStackEntry(attributes: any): any {
        var stackEntry = {};

        if (!attributes) {
            return stackEntry;
        }

        for (var key in attributes) {
            if (!attributes.hasOwnProperty(key)) {
                continue;
            }
            var attributeName = <string>key;
            if (attributeName.indexOf("xmlns") !== 0) {
                // This is a normal attribute, so go on.
                continue;
            }

            var namespacePrefix = "";
            if (attributeName.indexOf(":") !== -1) {
                namespacePrefix = attributeName.split(":")[1];
            }

            stackEntry[namespacePrefix] = attributes[key];
        }

        return stackEntry;
    }

    private _resolveNamespace(fullName: string): { prefix: string; namespace: string; name: string; } {
        var result: { prefix: string; namespace: string; name: string; } = { prefix: undefined, namespace: undefined, name: undefined }
        result.prefix = "";
        if (fullName.indexOf(":") !== -1) {
            var split = fullName.split(":");
            result.prefix = split[0];
            result.name = split[1];
        }
        else {
            result.name = fullName;
        }

        var i;
        var stackEntry;
        for (i = this._namespaceStack.length - 1; i >= 0; i--) {
            stackEntry = this._namespaceStack[i];

            for (var key in stackEntry) {
                if (!stackEntry.hasOwnProperty(key)) {
                    continue;
                }

                if (result.prefix === key) {
                    result.namespace = stackEntry[key];
                    return result;
                }
            }
        }

        return result;
    }

    private static _dereferenceEntities(s: string): string {
        s = String(s);
        if (s.length > 3 && s.indexOf('&') !== -1) {
            if (s.indexOf('&lt;') !== -1) { 
                s = s.replace(/&lt;/g, '<'); 
            }
            
            if (s.indexOf('&gt;') !== -1) { 
                s = s.replace(/&gt;/g, '>'); 
            }
            
            if (s.indexOf('&amp;') !== -1) { 
                s = s.replace(/&amp;/g, '&'); 
            }
            
            if (s.indexOf('&apos;') !== -1) { 
                s = s.replace(/&apos;/g, "'"); 
            }
            
            if (s.indexOf('&quot;') !== -1) { 
                s = s.replace(/&quot;/g, '"'); 
            }
        };

        return s;
    }
}