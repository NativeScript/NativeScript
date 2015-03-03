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

	function nullFunc() {};

	var onTextNode = nullFunc, onStartNode = nullFunc, onEndNode = nullFunc, onCDATA = nullFunc, onError = nullFunc, onComment, onQuestion, onAttention;
	var is_onComment, is_onQuestion, is_onAttention;

	var isNamespace = false, useNS , default_xmlns, xmlns
	, nsmatrix = {xmlns: xmlns}
	, hasSurmiseNS = false
	;


	this.on = function(name, cb) {
		if (typeof cb !== 'function') {
			if (cb !== null) return;
		};

		switch(name) {
			case 'error': onError = cb || nullFunc; break;
			case 'startNode': onStartNode = cb || nullFunc; break;
			case 'endNode': onEndNode = cb || nullFunc; break;
			case 'textNode': onTextNode = cb || nullFunc; break;
			case 'cdata': onCDATA = cb || nullFunc; break;

			case 'comment': onComment = cb; is_onComment = !!cb; break;
			case 'question': onQuestion = cb; is_onQuestion = !!cb; break; // <? ....  ?>
			case 'attention': onAttention = cb; is_onAttention = !!cb; break; // <!XXXXX zzzz="eeee">
			
		}; 
	};

	this.ns = function(root, ns) {
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
			isNamespace = true;
			default_xmlns = root;
			useNS = x;
		};
	};

	this.parse = function(xml) {
		if (typeof xml !== 'string') {
			return;
		};

		if (isNamespace) {
			nsmatrix = {xmlns: default_xmlns};

			parse(xml);
			
			nsmatrix = false;

		} else {
			parse(xml);
		};

		attr_res = true;
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

	var attr_string = ''; // строка атрибутов
	var attr_posstart = 0; // 
	var attr_res; // закешированный результат разбора атрибутов , null - разбор не проводился, object - хеш атрибутов, true - нет атрибутов, false - невалидный xml

	/*
		парсит атрибуты по требованию. Важно! - функция не генерирует исключения.

		если была ошибка разбора возврашается false
		если атрибутов нет и разбор удачен то возврашается true
		если есть атрибуты то возврашается обьект(хеш)
	*/

	var RGX_ATTR_NAME = /[^\w:-]+/g;

	function getAttrs() {
		if (attr_res !== null) {
			return attr_res;
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
		, s = attr_string
		, i = attr_posstart
		, l = s.length
		, attr_list = hasSurmiseNS ? [] : false
		, name, value = ''
		, ok = false
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

			if (w < 65 || w >122 || (w>90 && w<97) ) { // ожидаем символ
				//console.log('error attr 1')
				return attr_res = false; // error. invalid char
			};

			for(j = i + 1; j < l; j++) { // проверяем все символы имени атрибута 
				w = s.charCodeAt(j);

				if (w > 96 && w < 123 || w > 64 && w < 91 || w > 47 && w < 59 || w === 45 || w === 95 || w === 46 /* https://github.com/telerik/xPlatCore/issues/179 */) {
					continue;
				};


				if (w !== 61) { // "=" == 61
					//console.log('error 2');
					return attr_res = false; // error. invalid char
				};

				break;
			};

			name = s.substring(i, j);
			ok = true;

			if (name === 'xmlns:xmlns') {
				//console.log('error 6')
				return attr_res = false; // error. invalid name
			};

			w = s.charCodeAt(j+1);

			if (w === 34) {  // '"'
				j = s.indexOf('"', i = j+2 );

			} else {
				if (w === 39) {
					j = s.indexOf('\'', i = j+2 );

				} else {  // "'"
					//console.log('error 3')
					return attr_res = false; // error. invalid char
				};
			};

			if (j === -1) {
				//console.log('error 4')
				return attr_res = false; // error. invalid char
			};


			if (j+1 < l) {
				w = s.charCodeAt(j+1);

				if (w > 32 || w < 9 || (w<32 && w>13)) {
					// error. invalid char
					//console.log('error 5')
					return attr_res = false;
				};
			};


			value = s.substring(i, j);
			i = j + 1; // след. семвол уже проверен потому проверять нужно следуюший

			if (isNamespace) { // 
				if (hasSurmiseNS) {
					// есть подозрение что в атрибутах присутствует xmlns

					if (newalias = name === 'xmlns' ? 'xmlns' : name.charCodeAt(0) === 120 && name.substr(0, 6) === 'xmlns:' && name.substr(6) ) {
						alias = useNS[unEntities(value)];

						if (alias) {
							if (nsmatrix[newalias] !== alias) {
								if (!hasNewMatrix) {
									hasNewMatrix = true;
									nn = {}; for (n in nsmatrix) nn[n] = nsmatrix[n];
									nsmatrix = nn;
								};

								nsmatrix[newalias] = alias;
							};
						} else {
							if (nsmatrix[newalias]) {
								if (!hasNewMatrix) {
									hasNewMatrix = true;
									nn = {}; for (n in nsmatrix) nn[n] = nsmatrix[n];
									nsmatrix = nn;
								};

								nsmatrix[newalias] = false;
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
						if (w = nsmatrix[name.substring(0, w)] ) {
							res[w + name.substr(w)] = value;
						};
						continue aa;

						// 'xml:base' ???
					};
				};
			};

			res[name] = value;
		};


		if (!ok) {
			return attr_res = true;  // атрибутов нет, ошибок тоже нет
		};
		

		if (hasSurmiseNS)  {
			bb: 

			for (i = 0, l = attr_list.length; i < l; i++) {
				name = attr_list[i++];

				w = name.length;
				while(--w) { // name.indexOf(':')
					if (name.charCodeAt(w) === 58) { // ':'
						if (w = nsmatrix[name.substring(0, w)]) {
							res[w + name.substr(w)] = attr_list[i];
						};
						continue bb;
						break;
					};
				};

				res[name] = attr_list[i];
			};
		};

		return attr_res = res;
	};


	// xml - string
	function parse(xml) {
		var u
		, xml = String(xml)
		, nodestack = []
		, stacknsmatrix = []
		//, string_node
		, elem
		, tagend = false
		, tagstart = false
		, j = 0, i = 0
		, x, y, q, w
		, xmlns
		, stopIndex = 0
		, stop // используется при разборе "namespace" . если встретился неизвестное пространство то события не генерируются
		, _nsmatrix
		, ok
		;

		function getStringNode() {
			return xml.substring(i, j+1)
		};

		while(j !== -1) {
			stop = stopIndex > 0;

			if (xml.charCodeAt(j) === 60) { // "<"
				i = j;
			} else {
				i = xml.indexOf('<', j);
			};

			if (i === -1) { // конец разбора

				if (nodestack.length) {
					onError('end file');
					return;
				};

				return;
			};

			if (j !== i && !stop) {
				ok = onTextNode(xml.substring(j, i), unEntities);
				if (ok === false) return;
			};

			w = xml.charCodeAt(i+1);

			if (w === 33) { // "!"
				w = xml.charCodeAt(i+2);
				if (w === 91 && xml.substr(i+3, 6) === 'CDATA[') { // 91 == "["
					j = xml.indexOf(']]>', i);
					if (j === -1) {
						onError('cdata');
						return;
					};
					
					//x = xml.substring(i+9, j);
					if (!stop) {
						ok = onCDATA(xml.substring(i+9, j), false);
						if (ok === false) return;
					};
					

					j += 3;
					continue;
				};
				

				if (w === 45 && xml.charCodeAt(i+3) === 45) { // 45 == "-"
					j = xml.indexOf('-->', i);
					if (j === -1) {
						onError('expected -->');
						return;
					};


					if (is_onComment && !stop) {
						ok = onComment(xml.substring(i+4, j), unEntities);
						if (ok === false) return;
					};

					j += 3;
					continue;
				};

				j = xml.indexOf('>', i+1);
				if (j === -1) {
					onError('expected ">"');
					return;
				};

				if (is_onAttention && !stop) {
					ok = onAttention(xml.substring(i, j+1), unEntities);
					if (ok === false) return;
				};

				j += 1;
				continue;

			} else {
				if (w === 63) { // "?"
					j = xml.indexOf('?>', i);
					if (j === -1) { // error
						onError('...?>');
						return;
					};
					
					if (is_onQuestion) {
						ok = onQuestion(xml.substring(i, j+2));
						if (ok === false) return;
					};

					j += 2;
					continue;
				};
			};

			j = xml.indexOf('>', i+1);

			if (j == -1) { // error 
				onError('...>');
				return;
			};

			attr_res = true; // атрибутов нет

			//if (xml.charCodeAt(i+1) === 47) { // </...
			if (w === 47) { // </...
				tagstart = false;
				tagend = true;

				// проверяем что должен быть закрыт тотже тег что и открывался
				x = elem = nodestack.pop();
				q = i + 2 + x.length;

				//console.log()
				if (xml.substring(i+2, q) !== x) {
					onError('close tagname');
					return;
				};

				// проверим что в закрываюшем теге нет лишнего
				for(; q < j; q++) {
					w = xml.charCodeAt(q);

					if (w===32 || (w > 8 && w<14) ) {  // \f\n\r\t\v пробел
						continue;
					};

					onError('close tag');
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
					onError('first char nodeName');
					return;
				};

				for(q = 1, y = x.length; q < y; q++) {
					w = x.charCodeAt(q);

					if (w > 96 && w < 123 || w > 64 && w < 91 || w > 47 && w < 59 || w === 45 || w === 95 || w === 46 /* https://github.com/telerik/xPlatCore/issues/179 */) {
						continue;
					};

					if (w===32 || (w<14 && w > 8)) { // \f\n\r\t\v пробел
						elem = x.substring(0, q)
						attr_res = null; // возможно есть атирибуты
						break;
					};

					onError('invalid nodeName');
					return;
				};

				if (!tagend) {
					nodestack.push(elem);
				};
			};


			if (isNamespace) {
				if (stop) {
					if (tagend) {
						if (!tagstart) {
							if (--stopIndex === 0) {
								nsmatrix = stacknsmatrix.pop();
							};
						};

					} else {
						stopIndex += 1;
					};


					j += 1;
					continue;
				};

				_nsmatrix = nsmatrix;

				if (!tagend) {
					stacknsmatrix.push(nsmatrix);
					
					if (attr_res !== true) {
						if (hasSurmiseNS = x.indexOf('xmlns', q) !== -1) {
							attr_string = x;
							attr_posstart = q;

							getAttrs();

							hasSurmiseNS = false;
						};
					};
				};


				w = elem.indexOf(':'); 
				if (w !== -1) {
					xmlns = nsmatrix[elem.substring(0, w)];
					elem = elem.substr(w+1);
					
					
				} else {
					xmlns = nsmatrix.xmlns;
				};

				
				if (!xmlns) {
					if (tagend) {
						if (tagstart) {
							nsmatrix = _nsmatrix;
						} else {
							nsmatrix = stacknsmatrix.pop();
						};
					} else {
						stopIndex = 1; // первый элемент для которого не определено пространство имен 
						attr_res = true;
					};

					j += 1;
					continue;
				};

				elem = xmlns + ':' + elem;
			};

			//string_node = xml.substring(i, j+1); // текст ноды как есть
			

			if (tagstart) { // is_onStartNode
				attr_string = x;
				attr_posstart = q;

				ok = onStartNode(elem, getAttrs, unEntities, tagend
					, getStringNode
				);

				if (ok === false) {
					return;
				};

				attr_res = true;
			};

			if (tagend) {
				ok = onEndNode(elem, unEntities, tagstart
					, getStringNode
				);

				if (ok === false) {
					return;
				};

				if (isNamespace) {
					if (tagstart) {
						nsmatrix = _nsmatrix;
					} else {
						nsmatrix = stacknsmatrix.pop();
					};
				};
			};

			j += 1;
		}; 
	};
};





