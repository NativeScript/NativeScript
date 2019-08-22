Object.defineProperty(exports, "__esModule", { value: true });
var easysax = require("../js-libs/easysax");
var ParserEventType = (function () {
    function ParserEventType() {
    }
    ParserEventType.StartElement = "StartElement";
    ParserEventType.EndElement = "EndElement";
    ParserEventType.Text = "Text";
    ParserEventType.CDATA = "CDATA";
    ParserEventType.Comment = "Comment";
    return ParserEventType;
}());
exports.ParserEventType = ParserEventType;
var ParserEvent = (function () {
    function ParserEvent(eventType, position, prefix, namespace, elementName, attributes, data) {
        this._eventType = eventType;
        this._position = position;
        this._prefix = prefix;
        this._namespace = namespace;
        this._elementName = elementName;
        this._attributes = attributes;
        this._data = data;
    }
    ParserEvent.prototype.toString = function () {
        return JSON.stringify({
            eventType: this.eventType,
            position: this.position,
            prefix: this.prefix,
            namespace: this.namespace,
            elementName: this.elementName,
            attributes: this.attributes,
            data: this.data
        });
    };
    Object.defineProperty(ParserEvent.prototype, "eventType", {
        get: function () {
            return this._eventType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ParserEvent.prototype, "position", {
        get: function () {
            return this._position;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ParserEvent.prototype, "prefix", {
        get: function () {
            return this._prefix;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ParserEvent.prototype, "namespace", {
        get: function () {
            return this._namespace;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ParserEvent.prototype, "elementName", {
        get: function () {
            return this._elementName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ParserEvent.prototype, "attributes", {
        get: function () {
            return this._attributes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ParserEvent.prototype, "data", {
        get: function () {
            return this._data;
        },
        enumerable: true,
        configurable: true
    });
    return ParserEvent;
}());
exports.ParserEvent = ParserEvent;
var _ampCodes;
var _entitySearchRegEx = /&#(\d+);|&#x([0123456789abcdef]+);|&(\w+);/ig;
function _generateAmpMap() {
    var objCodes = { Tab: 9, NewLine: 10, excl: 33, quot: 34, QUOT: 34, num: 35, dollar: 36, percent: 37, amp: 38, AMP: 38, apos: 39, lpar: 40, rpar: 41, ast: 42, midast: 42, plus: 43, comma: 44, period: 46, sol: 47, colon: 58, semi: 59, lt: 60, LT: 60, equals: 61, gt: 62, GT: 62, quest: 63, commat: 64, lsqb: 91, lbrack: 91, bsol: 92, rsqb: 92, rbrack: 92, Hat: 94, lowbar: 95, grave: 96, DiacriticalGrave: 96, lcub: 123, lbrace: 123, verbar: 124, vert: 124, VerticalLine: 124, rcub: 125, rbrace: 125, nbsp: 160, iexcl: 161, cent: 162, pound: 163, curren: 164, yen: 165, brvbar: 166, brkbar: 166, sect: 167, uml: 168, copy: 169, ordf: 170, laquo: 171, not: 172, shy: 173, reg: 174, macr: 175, hibar: 175, deg: 176, plusmn: 177, sup2: 178, sup3: 179, acute: 180, micro: 181, para: 182, middot: 183, cedil: 184, sup1: 185, ordm: 186, raquo: 187, frac14: 188, frac12: 189, frac34: 190, iquest: 191, Agrave: 192, Aacute: 193, Acirc: 194, Atilde: 195, Auml: 196, Aring: 197, AElig: 198, Ccedil: 199, Egrave: 200, Eacute: 201, Ecirc: 202, Euml: 203, Igrave: 204, Iacute: 205, Icirc: 206, Iuml: 207, ETH: 208, Dstrok: 208, Ntilde: 209, Ograve: 210, Oacute: 211, Ocirc: 212, Otilde: 213, Ouml: 214, times: 215, Oslash: 216, Ugrave: 217, Uacute: 218, Ucirc: 219, Uuml: 220, Yacute: 221, THORN: 222, szlig: 223, agrave: 224, aacute: 225, acirc: 226, atilde: 227, auml: 228, aring: 229, aelig: 230, ccedil: 231, egrave: 232, eacute: 233, ecirc: 234, euml: 235, igrave: 236, iacute: 237, icirc: 238, iuml: 239, eth: 240, ntilde: 241, ograve: 242, oacute: 243, ocirc: 244, otilde: 245, ouml: 246, divide: 247, oslash: 248, ugrave: 249, uacute: 250, ucirc: 251, uuml: 252, yacute: 253, thorn: 254, yuml: 255, fnof: 402, imped: 437, gacute: 501, jmath: 567, circ: 710, caron: 711, Hacek: 711, breve: 728, Breve: 728, dot: 729, DiacriticalDot: 729, ring: 730, ogon: 731, tilde: 732, DiacriticalTilde: 732, dblac: 733, DiacriticalDoubleAcute: 733, DownBreve: 785, UnderBar: 818, Alpha: 913, Beta: 914, Gamma: 915, Delta: 916, Epsilon: 917, Zeta: 918, Eta: 919, Theta: 920, Iota: 921, Kappa: 922, Lambda: 923, Mu: 924, Nu: 925, Xi: 926, Omicron: 927, Pi: 928, Rho: 929, Sigma: 931, Tau: 932, Upsilon: 933, Phi: 934, Chi: 935, Psi: 936, Omega: 937, alpha: 945, beta: 946, gamma: 947, delta: 948, epsilon: 949, epsiv: 949, varepsilon: 949, zeta: 950, eta: 951, theta: 952, iota: 953, kappa: 954, lambda: 955, mu: 956, nu: 957, xi: 958, omicron: 959, pi: 960, rho: 961, sigmaf: 962, sigmav: 962, varsigma: 962, sigma: 963, tau: 964, upsilon: 965, phi: 966, chi: 967, psi: 968, omega: 969, thetav: 977, vartheta: 977, thetasym: 977, Upsi: 978, upsih: 978, straightphi: 981, piv: 982, varpi: 982, Gammad: 988, gammad: 989, digamma: 989, kappav: 1008, varkappa: 1008, rhov: 1009, varrho: 1009, epsi: 1013, straightepsilon: 1013, bepsi: 1014, backepsilon: 1014, euro: 8364, trade: 8482, TRADE: 8482, forall: 8704, part: 8706, larr: 8592, rarr: 8593, hyphen: 8208, dash: 8208, ndash: 8211, mdash: 8212, horbar: 8213, Vert: 8214, Verbar: 8214, lsquo: 8216, OpenCurlyQuote: 8216, rsquo: 8217, rsquor: 8217, CloseCurlyQuote: 8217, lsquor: 8218, sbquo: 8218, ldquo: 8220, OpenCurlyDoubleQuote: 8220, rdquo: 8221, rdquor: 8221, CloseCurlyDoubleQuote: 8221, ldquor: 8222, bdquo: 8222, dagger: 8224, Dagger: 8225, ddagger: 8225, bull: 8226, bullet: 8226, nldr: 8229, hellip: 8230, mldr: 8230, hybull: 8259, tdot: 8411, TripleDot: 8411, DotDot: 8412, star: 9734, phone: 9742, spades: 9824, clubs: 9827, hearts: 9829, diams: 9830, female: 9792, male: 9794, check: 10003, checkmark: 10003, cross: 10007, VerticalSeparator: 10072, EmptySmallSquare: 9723, FilledSmallSquare: 9724, starf: 9733, bigstar: 9733, square: 9633, squ: 9633, Square: 9633 };
    var ampCodes = new Map();
    for (var key in objCodes) {
        if (objCodes.hasOwnProperty(key)) {
            ampCodes.set(key, objCodes[key]);
        }
    }
    return ampCodes;
}
if (global.__snapshot) {
    _ampCodes = _generateAmpMap();
}
function _HandleAmpEntities(found, decimalValue, hexValue, wordValue) {
    if (wordValue) {
        if (!_ampCodes) {
            _ampCodes = _generateAmpMap();
        }
        var res = _ampCodes.get(wordValue);
        if (res) {
            return String.fromCodePoint(res);
        }
        return found;
    }
    if (decimalValue) {
        return String.fromCodePoint(parseInt(decimalValue, 10));
    }
    return String.fromCodePoint(parseInt(hexValue, 16));
}
var XmlParser = (function () {
    function XmlParser(onEvent, onError, processNamespaces) {
        this._processNamespaces = processNamespaces;
        this._parser = new easysax.EasySAXParser();
        var that = this;
        this._parser.on("startNode", function (elem, attr, uq, tagend, str, pos) {
            var attributes = attr();
            if (attributes === true) {
                attributes = undefined;
            }
            if (attributes) {
                for (var key in attributes) {
                    if (attributes.hasOwnProperty(key)) {
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
            onEvent(new ParserEvent(ParserEventType.StartElement, pos(), prefix, namespace, name, attributes, undefined));
        });
        this._parser.on("textNode", function (text, uq, pos) {
            var data = uq(XmlParser._dereferenceEntities(text));
            onEvent(new ParserEvent(ParserEventType.Text, pos(), undefined, undefined, undefined, undefined, data));
        });
        this._parser.on("endNode", function (elem, uq, tagstart, str, pos) {
            var prefix = undefined;
            var namespace = undefined;
            var name = elem;
            if (that._processNamespaces) {
                var resolved = that._resolveNamespace(name);
                prefix = resolved.prefix;
                namespace = resolved.namespace;
                name = resolved.name;
            }
            onEvent(new ParserEvent(ParserEventType.EndElement, pos(), prefix, namespace, name, undefined, undefined));
            if (that._processNamespaces) {
                that._namespaceStack.pop();
            }
        });
        this._parser.on("cdata", function (data, res, pos) {
            onEvent(new ParserEvent(ParserEventType.CDATA, pos(), undefined, undefined, undefined, undefined, data));
        });
        this._parser.on("comment", function (text, uq, pos) {
            onEvent(new ParserEvent(ParserEventType.Comment, pos(), undefined, undefined, undefined, undefined, text));
        });
        if (onError) {
            this._parser.on("error", function (msg, pos) {
                onError(new Error(msg), pos());
            });
        }
    }
    Object.defineProperty(XmlParser.prototype, "angularSyntax", {
        get: function () {
            return this._parser.angularSyntax;
        },
        set: function (value) {
            this._parser.angularSyntax = value;
        },
        enumerable: true,
        configurable: true
    });
    XmlParser.prototype.parse = function (xmlString) {
        if (this._processNamespaces) {
            this._namespaceStack = [];
        }
        this._parser.parse(xmlString);
    };
    XmlParser._getNamespacesStackEntry = function (attributes) {
        var stackEntry = {};
        if (!attributes) {
            return stackEntry;
        }
        var attributeName;
        var namespacePrefix;
        for (var key in attributes) {
            if (!attributes.hasOwnProperty(key)) {
                continue;
            }
            attributeName = key;
            if (attributeName.indexOf("xmlns") !== 0) {
                continue;
            }
            namespacePrefix = "";
            if (attributeName.indexOf(":") !== -1) {
                namespacePrefix = attributeName.split(":")[1];
            }
            stackEntry[namespacePrefix] = attributes[key];
        }
        return stackEntry;
    };
    XmlParser.prototype._resolveNamespace = function (fullName) {
        var result = { prefix: undefined, namespace: undefined, name: undefined };
        result.prefix = "";
        if (fullName.indexOf(":") !== -1) {
            var split = fullName.split(":");
            result.prefix = split[0];
            result.name = split[1];
        }
        else {
            result.name = fullName;
        }
        var stackEntry;
        for (var i = this._namespaceStack.length - 1; i >= 0; i--) {
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
    };
    XmlParser._dereferenceEntities = function (s) {
        s = String(s);
        if (s.length > 3 && s.indexOf("&") !== -1) {
            s = s.replace(_entitySearchRegEx, _HandleAmpEntities);
        }
        return s;
    };
    return XmlParser;
}());
exports.XmlParser = XmlParser;
//# sourceMappingURL=xml.js.map