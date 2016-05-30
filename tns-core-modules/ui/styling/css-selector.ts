import view = require("ui/core/view");
import observable = require("ui/core/dependency-observable");
import cssParser = require("css");
import * as trace from "trace";
import {StyleProperty, ResolvedStylePropertyHandler, withStyleProperty} from "ui/styling/style-property";
import * as types from "utils/types";
import * as utils from "utils/utils";
import keyframeAnimation = require("ui/animation/keyframe-animation");
import cssAnimationParser = require("./css-animation-parser");
import {getSpecialPropertySetter} from "ui/builder/special-properties";

let ID_SPECIFICITY = 1000000;
let ATTR_SPECIFITY = 10000;
let CLASS_SPECIFICITY = 100;
let TYPE_SPECIFICITY = 1;

export class CssSelector {
    public animations: Array<keyframeAnimation.KeyframeAnimationInfo>;

    private _expression: string;
    private _declarations: cssParser.Declaration[];
    private _attrExpression: string;

    constructor(expression: string, declarations: cssParser.Declaration[]) {
        if (expression) {
            let leftSquareBracketIndex = expression.indexOf(LSBRACKET);
            if (leftSquareBracketIndex >= 0) {
                // extracts what is inside square brackets ([target = 'test'] will extract "target = 'test'")
                let paramsRegex = /\[\s*(.*)\s*\]/;
                let attrParams = paramsRegex.exec(expression);
                if (attrParams && attrParams.length > 1) {
                    this._attrExpression = attrParams[1].trim();
                }
                this._expression = expression.substr(0, leftSquareBracketIndex);
            }
            else {
                this._expression = expression;
            }
        }
        this._declarations = declarations;
        this.animations = cssAnimationParser.CssAnimationParser.keyframeAnimationsFromCSSDeclarations(declarations);
    }

    get expression(): string {
        return this._expression;
    }

    get attrExpression(): string {
        return this._attrExpression;
    }

    get declarations(): Array<{ property: string; value: any }> {
        return this._declarations;
    }

    get specificity(): number {
        throw "Specificity property is abstract";
    }

    protected get valueSourceModifier(): number {
        return observable.ValueSource.Css;
    }

    public matches(view: view.View): boolean {
        return false;
    }

    public apply(view: view.View, valueSourceModifier: number) {
        let modifier = valueSourceModifier || this.valueSourceModifier;
        this.eachSetter((property, value) => {
            if (types.isString(property)) {
                const propertyName = <string>property;
                let attrHandled = false;
                let specialSetter = getSpecialPropertySetter(propertyName);

                if (!attrHandled && specialSetter) {
                    specialSetter(view, value);
                    attrHandled = true;
                }

                if (!attrHandled && propertyName in view) {
                    view[propertyName] = utils.convertString(value);
                }
            } else {
                const resolvedProperty = <StyleProperty>property;
                try {
                    view.style._setValue(resolvedProperty, value, modifier);
                } catch (ex) {
                    if (trace.enabled) {
                        trace.write("Error setting property: " + resolvedProperty.name + " view: " + view + " value: " + value + " " + ex, trace.categories.Style, trace.messageType.error);
                    }
                }
            }
        });
        view._unregisterAllAnimations();
        if (this.animations && view.isLoaded && view._nativeView !== undefined) {
            for (let animationInfo of this.animations) {
                let animation = keyframeAnimation.KeyframeAnimation.keyframeAnimationFromInfo(animationInfo, modifier);
                if (animation) {
                    view._registerAnimation(animation);
                    animation.play(view)
                        .then(() => { view._unregisterAnimation(animation);  })
                        .catch((e) => { view._unregisterAnimation(animation); });
                }
            }
        }
    }

    public eachSetter(callback: ResolvedStylePropertyHandler) {
        for (let i = 0; i < this._declarations.length; i++) {
            let declaration = this._declarations[i];
            let name = declaration.property;
            let resolvedValue = declaration.value;
            withStyleProperty(name, resolvedValue, callback);
        }
    }

    public get declarationText(): string {
        return this.declarations.map((declaration) => `${declaration.property}: ${declaration.value}`).join("; ");
    }

    public get attrExpressionText(): string  {
        if (this.attrExpression) {
            return `[${this.attrExpression}]`;
        } else {
            return "";
        }
    }
}

class CssTypeSelector extends CssSelector {
    get specificity(): number {
        let result = TYPE_SPECIFICITY;
        let dotIndex = this.expression.indexOf(DOT);
        if (dotIndex > -1) {
            result += CLASS_SPECIFICITY;
        }
        return result;
    }
    public matches(view: view.View): boolean {
        let result = matchesType(this.expression, view);
        if (result && this.attrExpression) {
            return matchesAttr(this.attrExpression, view);
        }
        return result;
    }
    public toString(): string {
        return `CssTypeSelector ${this.expression}${this.attrExpressionText} { ${this.declarationText} }`;
    }
}

function matchesType(expression: string, view: view.View): boolean {
    let exprArr = expression.split(".");
    let exprTypeName = exprArr[0];
    let exprClassName = exprArr[1];

    let typeCheck = exprTypeName.toLowerCase() === view.typeName.toLowerCase() ||
        exprTypeName.toLowerCase() === view.typeName.split(/(?=[A-Z])/).join("-").toLowerCase();

    if (typeCheck) {
        if (exprClassName) {
            return view._cssClasses.some((cssClass, i, arr) => { return cssClass === exprClassName });
        }
        else {
            return typeCheck;
        }
    }
    else {
        return false;
    }
}

class CssIdSelector extends CssSelector {
    get specificity(): number {
        return ID_SPECIFICITY;
    }
    public matches(view: view.View): boolean {
        let result = this.expression === view.id;
        if (result && this.attrExpression) {
            return matchesAttr(this.attrExpression, view);
        }
        return result;
    }

    public toString(): string {
        return `CssIdSelector ${this.expression}${this.attrExpressionText} { ${this.declarationText} }`;
    }
}

class CssClassSelector extends CssSelector {
    get specificity(): number {
        return CLASS_SPECIFICITY;
    }
    public matches(view: view.View): boolean {
        let expectedClass = this.expression;
        let result = view._cssClasses.some((cssClass, i, arr) => { return cssClass === expectedClass });
        if (result && this.attrExpression) {
            return matchesAttr(this.attrExpression, view);
        }
        return result;
    }
    public toString(): string {
        return `CssClassSelector ${this.expression}${this.attrExpressionText} { ${this.declarationText} }`;
    }

}

class CssCompositeSelector extends CssSelector {
    get specificity(): number {
        let result = 0;
        for (let i = 0; i < this.parentCssSelectors.length; i++) {
            result += this.parentCssSelectors[i].selector.specificity;
        }
        return result;
    }

    private parentCssSelectors: [{ selector: CssSelector, onlyDirectParent: boolean }];

    private splitExpression(expression) {
        let result = [];
        let tempArr = [];
        let validSpace = true;
        for (let i = 0; i < expression.length; i++) {
            if (expression[i] === LSBRACKET) {
                validSpace = false;
            }
            if (expression[i] === RSBRACKET) {
                validSpace = true;
            }
            if ((expression[i] === SPACE && validSpace) || (expression[i] === GTHAN)) {
                if (tempArr.length > 0) {
                    result.push(tempArr.join(""));
                    tempArr = [];
                }
                if (expression[i] === GTHAN) {
                    result.push(GTHAN);
                }
                continue;
            }
            tempArr.push(expression[i]);
        }
        if (tempArr.length > 0) {
            result.push(tempArr.join(""));
        }
        return result;
    }

    constructor(expr: string, declarations: cssParser.Declaration[]) {
        super(expr, declarations);
        let expressions = this.splitExpression(expr);
        let onlyParent = false;
        this.parentCssSelectors = <any>[];
        for (let i = expressions.length - 1; i >= 0; i--) {
            if (expressions[i].trim() === GTHAN) {
                onlyParent = true;
                continue;
            }
            this.parentCssSelectors.push({ selector: createSelector(expressions[i].trim(), null), onlyDirectParent: onlyParent });
            onlyParent = false;
        }
    }

    public matches(view: view.View): boolean {
        let result = this.parentCssSelectors[0].selector.matches(view);
        if (!result) {
            return result;
        }
        let tempView = view.parent;
        for (let i = 1; i < this.parentCssSelectors.length; i++) {
            let parentCounter = 0;
            while (tempView && parentCounter === 0) {
                result = this.parentCssSelectors[i].selector.matches(tempView);
                if (result) {
                    tempView = tempView.parent;
                    break;
                }
                if (this.parentCssSelectors[i].onlyDirectParent) {
                    parentCounter++;
                }
                tempView = tempView.parent;
            }
            if (!result) {
                break;
            }
        }
        return result;
    }

    public toString(): string {
        return `CssCompositeSelector ${this.expression}${this.attrExpressionText} { ${this.declarationText} }`;
    }
}

class CssAttrSelector extends CssSelector {
    get specificity(): number {
        return ATTR_SPECIFITY;
    }

    public matches(view: view.View): boolean {
        return matchesAttr(this.attrExpression, view);
    }

    public toString(): string {
        return `CssAttrSelector ${this.expression}${this.attrExpressionText} { ${this.declarationText} }`;
    }
}

function matchesAttr(attrExpression: string, view: view.View): boolean {
    let equalSignIndex = attrExpression.indexOf(EQUAL);
    if (equalSignIndex > 0) {
        let nameValueRegex = /(.*[^~|\^\$\*])[~|\^\$\*]?=(.*)/;
        let nameValueRegexRes = nameValueRegex.exec(attrExpression);
        let attrName;
        let attrValue;
        if (nameValueRegexRes && nameValueRegexRes.length > 2) {
            attrName = nameValueRegexRes[1].trim();
            attrValue = nameValueRegexRes[2].trim().replace(/^(["'])*(.*)\1$/, '$2');
        }
        // extract entire sign (=, ~=, |=, ^=, $=, *=)
        let escapedAttrValue = utils.escapeRegexSymbols(attrValue);
        let attrCheckRegex;
        switch (attrExpression.charAt(equalSignIndex - 1)) {
            case "~":
                attrCheckRegex = new RegExp("(^|[^a-zA-Z-])" + escapedAttrValue + "([^a-zA-Z-]|$)");
                break;
            case "|":
                attrCheckRegex = new RegExp("^" + escapedAttrValue + "\\b");
                break;
            case "^":
                attrCheckRegex = new RegExp("^" + escapedAttrValue);
                break;
            case "$":
                attrCheckRegex = new RegExp(escapedAttrValue + "$");
                break;
            case "*":
                attrCheckRegex = new RegExp(escapedAttrValue);
                break;

            // only = (EQUAL)
            default:
                attrCheckRegex = new RegExp("^" + escapedAttrValue + "$");
                break;
        }
        return !types.isNullOrUndefined(view[attrName]) && attrCheckRegex.test(view[attrName] + "");
    } else {
        return !types.isNullOrUndefined(view[attrExpression]);
    }
}

export class CssVisualStateSelector extends CssSelector {
    private _key: string;
    private _match: string;
    private _state: string;
    private _isById: boolean;
    private _isByClass: boolean;
    private _isByType: boolean;
    private _isByAttr: boolean;

    get specificity(): number {
        return (this._isById ? ID_SPECIFICITY : 0) +
            (this._isByAttr ? ATTR_SPECIFITY : 0) +
            (this._isByClass ? CLASS_SPECIFICITY : 0) +
            (this._isByType ? TYPE_SPECIFICITY : 0);
    }

    get key(): string {
        return this._key;
    }

    get state(): string {
        return this._state;
    }

    protected get valueSourceModifier(): number {
        return observable.ValueSource.VisualState;
    }

    constructor(expression: string, declarations: cssParser.Declaration[]) {
        super(expression, declarations);

        let args = expression.split(COLON);
        this._key = args[0];
        this._state = args[1];

        if (this._key.charAt(0) === HASH) {
            this._match = this._key.substring(1);
            this._isById = true;
        } else if (this._key.charAt(0) === DOT) {
            this._match = this._key.substring(1);
            this._isByClass = true;
        } else if (this._key.charAt(0) === LSBRACKET) {
            this._match = this._key;
            this._isByAttr = true;
        }
        else if (this._key.length > 0) { // handle the case when there is no key. E.x. ":pressed" selector
            this._match = this._key;
            this._isByType = true;
        }
    }

    public matches(view: view.View): boolean {
        let matches = true;
        if (this._isById) {
            matches = this._match === view.id;
        }

        if (this._isByClass) {
            let expectedClass = this._match;
            matches = view._cssClasses.some((cssClass, i, arr) => { return cssClass === expectedClass });
        }

        if (this._isByType) {
            matches = matchesType(this._match, view);
        }

        if (this._isByAttr) {
            matches = matchesAttr(this._key, view);
        }

        return matches;
    }

    public toString(): string {
        return `CssVisualStateSelector ${this.expression}${this.attrExpressionText} { ${this.declarationText} }`;
    }
}

let HASH = "#";
let DOT = ".";
let COLON = ":";
let SPACE = " ";
let GTHAN = ">";
let LSBRACKET = "[";
let RSBRACKET = "]";
let EQUAL = "=";

export function createSelector(expression: string, declarations: cssParser.Declaration[]): CssSelector {
    let goodExpr = expression.replace(/>/g, " > ").replace(/\s\s+/g, " ");
    let spaceIndex = goodExpr.indexOf(SPACE);
    if (spaceIndex >= 0) {
        return new CssCompositeSelector(goodExpr, declarations);
    }

    let leftSquareBracketIndex = goodExpr.indexOf(LSBRACKET);
    if (leftSquareBracketIndex === 0) {
        return new CssAttrSelector(goodExpr, declarations);
    }

    var colonIndex = goodExpr.indexOf(COLON);
    if (colonIndex >= 0) {
        return new CssVisualStateSelector(goodExpr, declarations);
    }

    if (goodExpr.charAt(0) === HASH) {
        return new CssIdSelector(goodExpr.substring(1), declarations);
    }

    if (goodExpr.charAt(0) === DOT) {
        // TODO: Combinations like label.center
        return new CssClassSelector(goodExpr.substring(1), declarations);
    }

    return new CssTypeSelector(goodExpr, declarations);
}

class InlineStyleSelector extends CssSelector {
    constructor(declarations: cssParser.Declaration[]) {
        super(undefined, declarations)
    }

    public apply(view: view.View) {
        this.eachSetter((property, value) => {
            const resolvedProperty = <StyleProperty>property;
            view.style._setValue(resolvedProperty, value, observable.ValueSource.Local);
        });
    }

    public toString(): string {
        return `InlineStyleSelector ${this.expression}${this.attrExpressionText} { ${this.declarationText} }`;
    }
}

export function applyInlineSyle(view: view.View, declarations: cssParser.Declaration[]) {
    let localStyleSelector = new InlineStyleSelector(declarations);
    localStyleSelector.apply(view);
}
