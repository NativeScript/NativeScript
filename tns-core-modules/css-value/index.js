
module.exports = parse;

function parse(str) {
  return new Parser(str).parse();
}

function Parser(str) {
  this.str = str;
}

Parser.prototype.skip = function(m){
  this.str = this.str.slice(m[0].length);
};

Parser.prototype.comma = function(){
  var m = /^, */.exec(this.str);
  if (!m) return;
  this.skip(m);
  return { type: 'comma', string: ',' };
};

Parser.prototype.ident = function(){
  var m = /^([\w-]+) */.exec(this.str);
  if (!m) return;
  this.skip(m);
  return {
    type: 'ident',
    string: m[1]
  }
};

Parser.prototype.int = function(){
  var m = /^(([-\+]?\d+)(\S+)?) */.exec(this.str);
  if (!m) return;
  this.skip(m);
  var n = ~~m[2];
  var u = m[3];

  return {
    type: 'number',
    string: m[1],
    unit: u || '',
    value: n
  }
};

Parser.prototype.float = function(){
  var m = /^(((?:[-\+]?\d+)?\.\d+)(\S+)?) */.exec(this.str);
  if (!m) return;
  this.skip(m);
  var n = parseFloat(m[2]);
  var u = m[3];

  return {
    type: 'number',
    string: m[1],
    unit: u || '',
    value: n
  }
};

Parser.prototype.number = function(){
  return this.float() || this.int();
};

Parser.prototype.double = function(){
  var m = /^"([^"]*)" */.exec(this.str);
  if (!m) return m;
  this.skip(m);
  return {
    type: 'string',
    quote: '"',
    string: '"' + m[1] + '"',
    value: m[1]
  }
};

Parser.prototype.single = function(){
  var m = /^'([^']*)' */.exec(this.str);
  if (!m) return m;
  this.skip(m);
  return {
    type: 'string',
    quote: "'",
    string: "'" + m[1] + "'",
    value: m[1]
  }
};

Parser.prototype.string = function(){
  return this.single() || this.double();
};


Parser.prototype.value = function(){
  return this.number()
    || this.ident()
    || this.string()
    || this.comma();
};

Parser.prototype.parse = function(){
  var vals = [];

  while (this.str.length) {
    var obj = this.value();
    if (!obj) throw new Error('failed to parse near `' + this.str.slice(0, 10) + '...`');
    vals.push(obj);
  }

  return vals;
};
