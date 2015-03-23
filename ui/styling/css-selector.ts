import view = require("ui/core/view");
import observable = require("ui/core/dependency-observable");
import cssParser = require("js-libs/reworkcss");
import styleProperty = require("ui/styling/style-property");

var ID_SPECIFICITY = 10000;
var CLASS_SPECIFICITY = 100;
var TYPE_SPECIFICITY = 1;

export class CssSelector {
    private _expression: string;
    private _declarations: cssParser.Declaration[];

    constructor(expression: string, declarations: cssParser.Declaration[]) {
        this._expression = expression;
        this._declarations = declarations;
    }

    get expression(): string {
        return this._expression;
    }

    get declarations(): Array<{ property: string; value: any }> {
        return this._declarations;
    }

    get specificity(): number {
        throw "Specificity property is abstract";
    }

    public matches(view: view.View): boolean {
        return false;
    }

    public apply(view: view.View) {
        this.eachSetter((property, value) => {
            view.style._setValue(property, value, observable.ValueSource.Css);
        });
    }

    public eachSetter(callback: (property: styleProperty.Property, resolvedValue: any) => void) {
        var i,
            property: styleProperty.Property,
            resolvedValue;

        for (i = 0; i < this._declarations.length; i++) {
            property = styleProperty.getPropertyByCssName(this._declarations[i].property);
            if (property) {
                resolvedValue = this._declarations[i].value;
                // The property.valueConverter is now used to convert the value later on in DependencyObservable._setValueInternal.
                console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                callback(property, resolvedValue);
            }
        }
    }
}

class CssTypeSelector extends CssSelector {
    get specificity(): number {
        return TYPE_SPECIFICITY;
    }
    public matches(view: view.View): boolean {
        return this.expression.toLowerCase() === view.typeName.toLowerCase();
    }
}

class CssIdSelector extends CssSelector {
    get specificity(): number {
        return ID_SPECIFICITY;
    }
    public matches(view: view.View): boolean {
        return this.expression === view.id;
    }
}

class CssClassSelector extends CssSelector {
    get specificity(): number {
        return CLASS_SPECIFICITY;
    }
    public matches(view: view.View): boolean {
        var expectedClass = this.expression;
        return view._cssClasses.some((cssClass, i, arr) => { return cssClass === expectedClass });
    }
}

export class CssVisualStateSelector extends CssSelector {
    private _key: string;
    private _match: string;
    private _state: string;
    private _isById: boolean;
    private _isByClass: boolean;
    private _isByType: boolean;

    get specificity(): number {
        return (this._isById ? ID_SPECIFICITY : 0) +
            (this._isByClass ? CLASS_SPECIFICITY : 0) +
            (this._isByType ? TYPE_SPECIFICITY : 0);
    }

    get key(): string {
        return this._key;
    }

    get state(): string {
        return this._state;
    }

    constructor(expression: string, declarations: cssParser.Declaration[]) {
        super(expression, declarations);

        var args = expression.split(COLON);
        this._key = args[0];
        this._state = args[1];

        if (this._key.charAt(0) === AMP) {
            this._match = this._key.substring(1);
            this._isById = true;
        } else if (this._key.charAt(0) === DOT) {
            this._match = this._key.substring(1);
            this._isByClass = true;
        }
        else if (this._key.length > 0) { // handle the case when there is no key. E.x. ":pressed" selector
            this._match = this._key;
            this._isByType = true;
        }
    }

    public matches(view: view.View): boolean {
        var matches = true;
        if (this._isById) {
            matches = this._match === view.id;
        }

        if (this._isByClass) {
            var expectedClass = this._match;
            matches = view._cssClasses.some((cssClass, i, arr) => { return cssClass === expectedClass });
        }

        if (this._isByType) {
            matches = this._match === view.cssType.toLowerCase();
        }

        return matches;
    }
}

var AMP = "#",
    DOT = ".",
    COLON = ":";

export function createSelector(expression: string, declarations: cssParser.Declaration[]): CssSelector {
    var colonIndex = expression.indexOf(COLON);
    if (colonIndex >= 0) {
        return new CssVisualStateSelector(expression, declarations);
    }

    if (expression.charAt(0) === AMP) {
        return new CssIdSelector(expression.substring(1), declarations);
    }

    if (expression.charAt(0) === DOT) {
        // TODO: Combinations like label.center
        return new CssClassSelector(expression.substring(1), declarations);
    }

    return new CssTypeSelector(expression, declarations);
}

class InlineStyleSelector extends CssSelector {
    constructor(declarations: cssParser.Declaration[]) {
        super(undefined, declarations)
    }

    public apply(view: view.View) {
        this.eachSetter((property, value) => {
            view.style._setValue(property, value, observable.ValueSource.Local);
        });
    }
}

export function applyInlineSyle(view: view.View, declarations : cssParser.Declaration[]) {
    var localStyleSelector = new InlineStyleSelector(declarations);
    localStyleSelector.apply(view);
}