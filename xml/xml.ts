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

var _ampCodes = {Tab: 9, NewLine: 10, excl: 33, quot: 34, QUOT: 34, num: 35, dollar: 36, percent: 37, amp: 38, AMP: 38, apos: 39, lpar: 40, rpar: 41, ast: 42, midast: 42, plus: 43, comma: 44, period: 46, sol: 47, colon: 58, semi: 59, lt: 60, LT: 60, equals: 61, gt: 62, GT: 62, quest: 63, commat: 64, lsqb: 91, lbrack: 91, bsol: 92, rsqb: 92, rbrack: 92, Hat: 94, lowbar: 95, grave: 96, DiacriticalGrave: 96, lcub: 123, lbrace: 123, verbar: 124, vert: 124, VerticalLine: 124, rcub: 125, rbrace: 125, brkbar:166, hibar: 175, Dstrok: 208, fnof: 402, imped: 437, gacute: 501, jmath: 567, circ: 710, caron: 711, Hacek: 711, breve: 728, Breve: 728, dot: 729, DiacriticalDot: 729, ring: 730, ogon: 731, tilde: 732, DiacriticalTilde: 732, dblac: 733, DiacriticalDoubleAcute: 733, DownBreve: 785, UnderBar: 818, epsiv: 949, varepsilon: 949, sigmav:962, varsigma: 962, thetav: 977, vartheta: 977, thetasym: 977, Upsi: 978, upsih: 978, straightphi: 981, piv: 982, varpi: 982, Gammad: 988, gammad: 989, digamma: 989, kappav: 1008, varkappa: 1008, rhov: 1009, varrho: 1009, epsi:1013, straightepsilon: 1013, bepsi: 1014, backepsilon: 1014, /* Skipped Codes 1015 - 1119 */ euro: 8364, trade: 8482, TRADE: 8482, forall: 8704, part: 8706, larr: 8592, rarr: 8593, hyphen: 8208, dash: 8208, ndash: 8211, mdash: 8212, horbar: 8213, Vert: 8214, Verbar: 8214, lsquo: 8216, OpenCurlyQuote: 8216, rsquo: 8217, rsquor: 8217, CloseCurlyQuote: 8217, lsquor: 8218, sbquo: 8218, ldquo: 8220, OpenCurlyDoubleQuote: 8220, rdquo: 8221, rdquor: 8221, CloseCurlyDoubleQuote: 8221, ldquor: 8222, bdquo: 8222, dagger: 8224, Dagger: 8225, ddagger: 8225, bull: 8226, bullet: 8226, nldr: 8229, hellip: 8230, mldr: 8230, hybull: 8259, tdot: 8411, TripleDot: 8411 ,DotDot: 8412, star: 9734, phone: 9742, spades: 9824, clubs: 9827, hearts: 9829, diams: 9830, female: 9792, male: 9794, check: 10003, checkmark: 10003, cross: 10007, VerticalSeparator: 10072, EmptySmallSquare: 9723, FilledSmallSquare: 9724, starf: 9733, bigstar: 9733, square: 9633, squ: 9633, Square: 9633};
var _amp160List = ['nbsp','iexcl','cent','pound','curren','yen','brvbar','sect','uml','copy','ordf','laquo','not','shy','reg','macr','deg','plusmn','sup2','sup3','acute','micro','para','middot','cedil','sup1','ordm','raquo','frac14','frac12','frac34','iquest','Agrave','Aacute','Acirc','Atilde','Auml','Aring','AElig','Ccedil','Egrave','Eacute','Ecirc','Euml','Igrave','Iacute','Icirc','Iuml','ETH','Ntilde','Ograve','Oacute','Ocirc','Otilde','Ouml','times','Oslash','Ugrave','Uacute','Ucirc','Uuml','Yacute','THORN','szlig','agrave','aacute','acirc','atilde','auml','aring','aelig','ccedil','egrave','eacute','ecirc','euml','igrave','iacute','icirc','iuml','eth','ntilde','ograve','oacute','ocirc','otilde','ouml','divide','oslash','ugrave','uacute','ucirc','uuml','yacute','thorn','yuml','Amacr','amacr','Abreve','abreve','Aogon','aogon'];
var _ampGreekUpper = ['Alpha','Beta','Gamma','Delta','Epsilon','Zeta','Eta','Theta','Iota','Kappa','Lambda','Mu','Nu','Xi','Omicron','Pi','Rho','M!SS!NG','Sigma','Tau','Upsilon','Phi','Chi','Psi','Omega'];
var _ampGreekLower = ['alpha','beta','gamma','delta','epsilon','zeta','eta','theta','iota','kappa','lambda','mu','nu','xi','omicron','pi','rho','sigmaf','sigma','tau','upsilon','phi','chi','psi','omega'];
var _entitySearchRegEx = /&#(\d+);|&#x([0123456789abcdef]+);|&(\w+);/ig;

function _HandleAmpEntities(found: string, decimalValue: string, hexValue: string, wordValue: string): string {

    if (wordValue) {
        if (_ampCodes.hasOwnProperty(wordValue)) {
            return String.fromCharCode(_ampCodes[wordValue]);
        }
        var idx = _amp160List.indexOf(wordValue);
        if (idx >= 0) {
            return String.fromCharCode(160 + idx);
        }
        idx = _ampGreekUpper.indexOf(wordValue);
        if (idx >= 0) {
            return String.fromCharCode(913 + idx);
        }
        idx = _ampGreekLower.indexOf(wordValue);
        if (idx >= 0) {
            return String.fromCharCode(945 + idx);
        }
        // Invalid word; so we just return it
        return found;
    }
    if (decimalValue) {
        return String.fromCharCode(parseInt(decimalValue,10));
    }

    return String.fromCharCode(parseInt(hexValue, 16));
};

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
            var data = uq(XmlParser._dereferenceEntities(text));// Decode entity references such as &lt; and &gt;
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

    public get angularSyntax() : boolean {
        return this._parser.angularSyntax;
    }

    public set angularSyntax(value: boolean) {
        this._parser.angularSyntax = value;
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
            s = s.replace(_entitySearchRegEx, _HandleAmpEntities);
        };

        return s;
    }
}
