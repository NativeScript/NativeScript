	/*
	new function() {
		var parser = new EasySAXParser();

		parser.ns('rss', { // or false
			rss: 'http://purl.org/rss/1.0/',
			atom: 'http://www.w3.org/2005/Atom',
			xhtml: 'http://www.w3.org/1999/xhtml',
			media: 'http://search.yahoo.com/mrss/'
		});


		parser.on('error', function(msg) {
			//console.log(msg)
		});

		parser.on('startNode', function(elem, attr, uq, tagend, getStrNode) {
			attr();
			return;
			if (tagend) {
				console.log('   '+str)
			} else {
				console.log('+  '+str)
			};
		});

		parser.on('endNode', function(elem, uq, tagstart, str) {
			return;
			if (!tagstart) console.log('-  ' + str)
		});

		parser.on('textNode', function(s, uq) {
			uq(s);
			return
			console.log('   '+s)
		});

		parser.on('cdata', function(data) {
		});


		parser.on('comment', function(text) {
			//console.log('--'+text+'--')
		});

		//parser.on('question', function() {}); // <? ... ?>
		//parser.on('attention', function() {}); // <!XXXXX zzzz="eeee">

		console.time('easysax');
		for(var z=1000;z--;) {
			parser.parse(xml)
		};
		console.timeEnd('easysax');
	};


	*/

// << ------------------------------------------------------------------------ >> //


if (typeof exports === 'object' /*&& this == exports*/) {
	module.exports.EasySAXParser = EasySAXParser;
};

function EasySAXParser() {
	'use strict';

	if (!this) return null;

    this.angularSyntax = false;

	function nullFunc() {};

	this.onTextNode = nullFunc;
    this.onStartNode = nullFunc;
    this.onEndNode = nullFunc;
    this.onCDATA = nullFunc;
    this.onError = nullFunc;
    this.onComment = null;
    this.onQuestion = null;
    this.onAttention = null;
	this.is_onComment = this.is_onQuestion = this.is_onAttention = false;

	this.isNamespace = false;
    this.useNS = null;
    this.default_xmlns = null;
    this.xmlns = null;
	this.nsmatrix = {xmlns: this.xmlns};
	this.hasSurmiseNS = false;
	;


	this.attr_string = ''; // строка атрибутов
	this.attr_posstart = 0; //
	this.attr_res; // закешированный результат разбора атрибутов , null - разбор не проводился, object - хеш атрибутов, true - нет атрибутов, false - невалидный xml
}

EasySAXParser.prototype.on = function(name, cb) {
    if (typeof cb !== 'function') {
        if (cb !== null) return;
    };

    switch(name) {
        case 'error': this.onError = cb || nullFunc; break;
        case 'startNode': this.onStartNode = cb || nullFunc; break;
        case 'endNode': this.onEndNode = cb || nullFunc; break;
        case 'textNode': this.onTextNode = cb || nullFunc; break;
        case 'cdata': this.onCDATA = cb || nullFunc; break;

        case 'comment': this.onComment = cb; this.is_onComment = !!cb; break;
        case 'question': this.onQuestion = cb; this.is_onQuestion = !!cb; break; // <? ....  ?>
        case 'attention': this.onAttention = cb; this.is_onAttention = !!cb; break; // <!XXXXX zzzz="eeee">
    };
};

EasySAXParser.prototype.ns = function(root, ns) {
    if (!root || typeof root !== 'string' || !ns) {
        return;
    };

    var u, x = {}, ok, v, i;

    for(i in ns) {
        v = ns[i];
        if (typeof v === 'string') {
            if (root === v) ok = true;
            x[i] = v;
        };
    };

    if (ok) {
        this.isNamespace = true;
        this.default_xmlns = root;
        this.useNS = x;
    };
};


EasySAXParser.prototype.parse = function(xml) {
    if (typeof xml !== 'string') {
        return;
    };

    if (this.isNamespace) {
        this.nsmatrix = {xmlns: this.default_xmlns};

        parse(xml);

        this.nsmatrix = false;

    } else {
        parse(xml);
    };

    this.attr_res = true;
};

// -----------------------------------------------------

var xharsQuot={constructor: false, hasOwnProperty: false, isPrototypeOf: false, propertyIsEnumerable: false, toLocaleString: false, toString: false, valueOf: false
    , quot: '"'
    , QUOT: '"'
    , amp: '&'
    , AMP: '&'
    , nbsp: '\u00A0'
    , apos: '\''
    , lt: '<'
    , LT: '<'
    , gt: '>'
    , GT: '>'
    , copy: '\u00A9'
    , laquo: '\u00AB'
    , raquo: '\u00BB'
    , reg: '\u00AE'
    , deg: '\u00B0'
    , plusmn: '\u00B1'
    , sup2: '\u00B2'
    , sup3: '\u00B3'
    , micro: '\u00B5'
    , para: '\u00B6'
};


function rpEntities(s, d, x, z) {
    if (z) {
        return xharsQuot[z] || '\x01';
    };

    if (d) {
        return String.fromCharCode(d);
    };

    return String.fromCharCode(parseInt(x, 16));
};

function unEntities(s, i) {
    s = String(s);
    if (s.length > 3 && s.indexOf('&') !== -1) {
        if (s.indexOf('&gt;') !== -1) s = s.replace(/&gt;/g, '>');
        if (s.indexOf('&lt;') !== -1) s = s.replace(/&lt;/g, '<');
        if (s.indexOf('&quot;') !== -1) s = s.replace(/&quot;/g, '"');

        if (s.indexOf('&') !== -1) {
            s = s.replace(/&#(\d+);|&#x([0123456789abcdef]+);|&(\w+);/ig, rpEntities);
        };
    };

    return s;
};


EasySAXParser.prototype.allowedAngularAttributeChars = function(w) {
    if (!this.angularSyntax) {
        return false;
    } else {
        return (
            w === 40 || // (
            w === 41 || // )
            w === 91 || // [
            w === 93 || // ]
            w === 94 || // ^
            w === 35    // #
        );
    }
};

	/*
		парсит атрибуты по требованию. Важно! - функция не генерирует исключения.

		если была ошибка разбора возврашается false
		если атрибутов нет и разбор удачен то возврашается true
		если есть атрибуты то возврашается обьект(хеш)
	*/

EasySAXParser.prototype.getAttrs = function() {
    if (this.attr_res !== null) {
        return this.attr_res;
    };

    /*
    if (xxtest !== u && attr_string.indexOf(xxtest) === -1) {
        / *
            // для ускорения
            if (getAttrs('html').type == 'html') {
                ...
            };
        * /
        return true;
    };
    */

    var u
    , res = {}
    , s = this.attr_string
    , i = this.attr_posstart
    , l = s.length
    , attr_list = this.hasSurmiseNS ? [] : false
    , name, value = ''
    , ok = false
    , noValueAttribute = false
    , j, w, nn, n
    , hasNewMatrix
    , alias, newalias
    ;

    aa:
    for(; i < l; i++) {
        w = s.charCodeAt(i);

        if (w===32 || (w<14 && w > 8) ) { // \f\n\r\t\v
            continue
        };

        // Check for valid attribute start char
        if ((w < 65 && !this.allowedAngularAttributeChars(w)) ||
                w > 122 || (w > 90 && w < 97 && !this.allowedAngularAttributeChars(w)) ) { // ожидаем символ
            return this.attr_res = false; // error. invalid char
        };

        for(j = i + 1; j < l; j++) { // проверяем все символы имени атрибута
            w = s.charCodeAt(j);

            if (w > 96 && w < 123 || w > 64 && w < 91 || w > 47 && w < 59 || w === 45 || w === 95 || w === 46 /* https://github.com/telerik/xPlatCore/issues/179 */) {
                if (noValueAttribute) {
                    j--; //Started next attribute. Get back and break out of the loop.
                    break;
                } else {
                    continue;
                }
            };

            if (this.allowedAngularAttributeChars(w)) {
                continue;
            }

            if (w === 32 || (w > 8 && w < 14) ) {  // \f\n\r\t\v пробел
                noValueAttribute = true;
                continue;
            } else if (w === 61) { // "=" == 61
                noValueAttribute = false;
                break;
            } else {
                //console.log('error 2');
                if (!noValueAttribute)
                    return this.attr_res = false; // error. invalid char
            };

            break;
        };

        name = s.substring(i, j).trim();
        ok = true;

        if (name === 'xmlns:xmlns') {
            //console.log('error 6')
            return this.attr_res = false; // error. invalid name
        };

        w = s.charCodeAt(j+1);

        while (w = s.charCodeAt(j+1)) {
            if (w===32 || (w > 8 && w<14) ) {  // \f\n\r\t\v пробел
                j++;
            } else {
                break;
            }
        }

        if (!noValueAttribute) {
            if (w === 34) {  // '"'
                j = s.indexOf('"', i = j+2 );

            } else {
                if (w === 39) {
                    j = s.indexOf('\'', i = j+2 );

                } else {  // "'"
                    return this.attr_res = false; // error. invalid char
                };
            };
        }

        if (j === -1) {
            //console.log('error 4')
            return this.attr_res = false; // error. invalid char
        };


        if (j+1 < l && !noValueAttribute) {
            w = s.charCodeAt(j+1);

            if (w > 32 || w < 9 || (w < 32 && w > 13)) {
                // error. invalid char
                //console.log('error 5')
                return this.attr_res = false;
            };
        };


        if (noValueAttribute) {
            value = '';
        } else {
            value = s.substring(i, j);
        }

        //i = j + 1; // след. семвол уже проверен потому проверять нужно следуюший
        i = j; // след. семвол уже проверен потому проверять нужно следуюший

        if (this.isNamespace) { //
            if (this.hasSurmiseNS) {
                // есть подозрение что в атрибутах присутствует xmlns

                if (newalias = name === 'xmlns' ? 'xmlns' : name.charCodeAt(0) === 120 && name.substr(0, 6) === 'xmlns:' && name.substr(6) ) {
                    alias = this.useNS[unEntities(value)];

                    if (alias) {
                        if (this.nsmatrix[newalias] !== alias) {
                            if (!hasNewMatrix) {
                                hasNewMatrix = true;
                                nn = {}; for (n in this.nsmatrix) nn[n] = this.nsmatrix[n];
                                this.nsmatrix = nn;
                            };

                            this.nsmatrix[newalias] = alias;
                        };
                    } else {
                        if (this.nsmatrix[newalias]) {
                            if (!hasNewMatrix) {
                                hasNewMatrix = true;
                                nn = {}; for (n in this.nsmatrix) nn[n] = this.nsmatrix[n];
                                this.nsmatrix = nn;
                            };

                            this.nsmatrix[newalias] = false;
                        };
                    };

                    res[name] = value;
                    continue;
                };

                attr_list.push(name, value);
                continue;
            };

            w = name.length;
            while(--w) {
                if (name.charCodeAt(w) === 58) { // ':'
                    if (w = this.nsmatrix[name.substring(0, w)] ) {
                        res[w + name.substr(w)] = value;
                    };
                    continue aa;

                    // 'xml:base' ???
                };
            };
        };

        res[name] = value;
        noValueAttribute = false;
    };


    if (!ok) {
        return this.attr_res = true;  // атрибутов нет, ошибок тоже нет
    };


    if (this.hasSurmiseNS)  {
        bb:

        for (i = 0, l = attr_list.length; i < l; i++) {
            name = attr_list[i++];

            w = name.length;
            while(--w) { // name.indexOf(':')
                if (name.charCodeAt(w) === 58) { // ':'
                    if (w = this.nsmatrix[name.substring(0, w)]) {
                        res[w + name.substr(w)] = attr_list[i];
                    };
                    continue bb;
                    break;
                };
            };

            res[name] = attr_list[i];
        };
    };

    return this.attr_res = res;
};


// xml - string
EasySAXParser.prototype.parse = function(xml) {
    var u
    , xml = String(xml)
    , nodestack = []
    , stacknsmatrix = []
    //, string_node
    , elem
    , tagend = false
    , tagstart = false
    , j = 0, i = 0, k = 0, len
    , x, y, q, w
    , xmlns
    , stopIndex = 0
    , stop // используется при разборе "namespace" . если встретился неизвестное пространство то события не генерируются
    , _nsmatrix
    , ok
    , pos = 0, ln = 0, lnStart = -2, lnEnd = -1
    ;

    len = xml.length;
    function getStringNode() {
        return xml.substring(i, j+1)
    };
    function findLineAndColumnFromPos() {
        while (lnStart < lnEnd && lnEnd < pos) {
            lnStart = lnEnd;
            lnEnd = xml.indexOf("\n", lnEnd + 1);
            ++ln;
        }
        return { line: ln, column: pos - lnStart };
    }
    function position(p) {
        pos = p;
        return findLineAndColumnFromPos;
    }

    while(j !== -1) {
        stop = stopIndex > 0;

        if (xml.charCodeAt(j) === 60) { // "<"
            i = j;
        } else {
            i = xml.indexOf('<', j);
        };

        if (i === -1) { // конец разбора

            if (nodestack.length) {
                this.onError('end file', position(j));
                return;
            };

            return;
        };

        if (j !== i && !stop) {
            ok = this.onTextNode(xml.substring(j, i), unEntities, position(j));
            if (ok === false) return;
        };

        w = xml.charCodeAt(i+1);

        if (w === 33) { // "!"
            w = xml.charCodeAt(i+2);
            if (w === 91 && xml.substr(i+3, 6) === 'CDATA[') { // 91 == "["
                j = xml.indexOf(']]>', i);
                if (j === -1) {
                    this.onError('cdata', position(i));
                    return;
                };

                //x = xml.substring(i+9, j);
                if (!stop) {
                    ok = this.onCDATA(xml.substring(i+9, j), false, position(i));
                    if (ok === false) return;
                };

                j += 3;
                continue;
            };

            if (w === 45 && xml.charCodeAt(i+3) === 45) { // 45 == "-"
                j = xml.indexOf('-->', i);
                if (j === -1) {
                    this.onError('expected -->', position(i));
                    return;
                };


                if (this.is_onComment && !stop) {
                    ok = this.onComment(xml.substring(i+4, j), unEntities, position(i));
                    if (ok === false) return;
                };

                j += 3;
                continue;
            };

            j = xml.indexOf('>', i+1);
            if (j === -1) {
                this.onError('expected ">"', position(i + 1));
                return;
            };

            if (this.is_onAttention && !stop) {
                ok = this.onAttention(xml.substring(i, j+1), unEntities, position(i));
                if (ok === false) return;
            };

            j += 1;
            continue;

        } else {
            if (w === 63) { // "?"
                j = xml.indexOf('?>', i);
                if (j === -1) { // error
                    this.onError('...?>', position(i));
                    return;
                };

                if (this.is_onQuestion) {
                    ok = this.onQuestion(xml.substring(i, j+2), position(i));
                    if (ok === false) return;
                };

                j += 2;
                continue;
            };
        };

        var inside=false;
        for (k=i,j=-1;k<len;k++) {
            var c = xml.charCodeAt(k);
            if (!inside) {

                if (c === 34) { // '"'
                    inside = c;
                }
                else if (c === 39) { // "'"
                    inside = c;
                }
                else if (c === 62) { // <
                    j = k; break;
                }
            } else {
                if (c === inside) { inside = false; }
            }
        }

        if (j == -1) { // error
            this.onError('...>', position(i + 1));
            return;
        };

        this.attr_res = true; // атрибутов нет

        //if (xml.charCodeAt(i+1) === 47) { // </...
        if (w === 47) { // </...
            tagstart = false;
            tagend = true;

            // проверяем что должен быть закрыт тотже тег что и открывался
            x = elem = nodestack.pop();
            q = i + 2 + x.length;

            //console.log()
            if (xml.substring(i+2, q) !== x) {
                this.onError('close tagname', position(i + 2));
                return;
            };

            // проверим что в закрываюшем теге нет лишнего
            for(; q < j; q++) {
                w = xml.charCodeAt(q);

                if (w===32 || (w > 8 && w<14) ) {  // \f\n\r\t\v пробел
                    continue;
                };

                this.onError('close tag', position(i + 2));
                return;
            };

        } else {
            if (xml.charCodeAt(j-1) ===  47) { // .../>
                x = elem = xml.substring(i+1, j-1);

                tagstart = true;
                tagend = true;
            } else {
                x = elem = xml.substring(i+1, j);

                tagstart = true;
                tagend = false;
            };

            if ( !(w > 96  && w < 123 || w > 64 && w <91) ) {
                this.onError('first char nodeName', position(i + 1));
                return;
            };

            for(q = 1, y = x.length; q < y; q++) {
                w = x.charCodeAt(q);

                if (w > 96 && w < 123 || w > 64 && w < 91 || w > 47 && w < 59 || w === 45 || w === 95 || w === 46 /* https://github.com/telerik/xPlatCore/issues/179 */) {
                    continue;
                };

                if (w===32 || (w<14 && w > 8)) { // \f\n\r\t\v пробел
                    elem = x.substring(0, q)
                    this.attr_res = null; // возможно есть атирибуты
                    break;
                };

                this.onError('invalid nodeName', position(i + 1));
                return;
            };

            if (!tagend) {
                nodestack.push(elem);
            };
        };


        if (this.isNamespace) {
            if (stop) {
                if (tagend) {
                    if (!tagstart) {
                        if (--stopIndex === 0) {
                            this.nsmatrix = stacknsmatrix.pop();
                        };
                    };

                } else {
                    stopIndex += 1;
                };


                j += 1;
                continue;
            };

            _nsmatrix = this.nsmatrix;

            if (!tagend) {
                stacknsmatrix.push(this.nsmatrix);

                if (this.attr_res !== true) {
                    if (this.hasSurmiseNS = x.indexOf('xmlns', q) !== -1) {
                        this.attr_string = x;
                        this.attr_posstart = q;

                        this.getAttrs();

                        this.hasSurmiseNS = false;
                    };
                };
            };


            w = elem.indexOf(':');
            if (w !== -1) {
                xmlns = this.nsmatrix[elem.substring(0, w)];
                elem = elem.substr(w+1);

            } else {
                xmlns = this.nsmatrix.xmlns;
            };

            if (!xmlns) {
                if (tagend) {
                    if (tagstart) {
                        this.nsmatrix = _nsmatrix;
                    } else {
                        this.nsmatrix = stacknsmatrix.pop();
                    };
                } else {
                    stopIndex = 1; // первый элемент для которого не определено пространство имен
                    this.attr_res = true;
                };

                j += 1;
                continue;
            };

            elem = xmlns + ':' + elem;
        };

        //string_node = xml.substring(i, j+1); // текст ноды как есть

        if (tagstart) { // is_onStartNode
            this.attr_string = x;
            this.attr_posstart = q;

            var that = this;
            ok = this.onStartNode(elem, function() { return that.getAttrs() }, unEntities, tagend
                , getStringNode, position(i)
            );

            if (ok === false) {
                return;
            };

            this.attr_res = true;
        };

        if (tagend) {
            ok = this.onEndNode(elem, unEntities, tagstart
                , getStringNode, position(i)
            );

            if (ok === false) {
                return;
            };

            if (this.isNamespace) {
                if (tagstart) {
                    this.nsmatrix = _nsmatrix;
                } else {
                    this.nsmatrix = stacknsmatrix.pop();
                };
            };
        };

        j += 1;
    };
};
