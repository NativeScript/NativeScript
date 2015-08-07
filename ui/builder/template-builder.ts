import definition = require("ui/builder/template-builder");

var KNOWNTEMPLATES = "knownTemplates";

export class TemplateBuilder {
    private _items: Array<string>;
    private _templateProperty: definition.TemplateProperty;
    private _nestingLevel: number;

    constructor(templateProperty: definition.TemplateProperty) {
        this._items = new Array<string>();
        this._templateProperty = templateProperty;
        this._nestingLevel = 0;
    }

    public get elementName(): string {
        return this._templateProperty.elementName;
    }

    public addStartElement(prefix: string, namespace: string, elementName: string, attributes: Object) {
        this._nestingLevel++;
        this._items.push("<" +
            getElementNameWithPrefix(prefix, elementName) +
            (namespace ? " " + getNamespace(prefix, namespace) : "") +
            (attributes ? " " + getAttributesAsString(attributes) : "") +
            ">");
    }

    public addEndElement(prefix: string, elementName: string) {
        this._nestingLevel--;
        if (!this.hasFinished()) {
            this._items.push("</" + getElementNameWithPrefix(prefix, elementName) + ">");
        }
    }

    public hasFinished() {
        return this._nestingLevel < 0;
    }

    public build() {
        if (this._templateProperty.name in this._templateProperty.parent.component) {
            this._templateProperty.parent.component[this._templateProperty.name] = this._items.join("");
        }
    }
}

export function isKnownTemplate(name: string, exports: any): boolean {
    return KNOWNTEMPLATES in exports && exports[KNOWNTEMPLATES] && name in exports[KNOWNTEMPLATES];
}

function getAttributesAsString(attributes: Object): string {
    var result = [];

    for (var item in attributes) {
        result.push(item + '="' + attributes[item] + '"');
    }

    return result.join(" ");
}

function getElementNameWithPrefix(prefix: string, elementName: string): string {
    return (prefix ? prefix + ":" : "") + elementName;
}

function getNamespace(prefix: string, namespace: string): string {
    return 'xmlns:' + prefix + '="' + namespace + '"';
}