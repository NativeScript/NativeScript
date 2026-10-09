'use strict';
exports.plain = function () { return this; };
exports.method = function () { return typeof this + ':' + this; };
