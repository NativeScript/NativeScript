import helperModule = require("console/console-native");

export class Console {
    private _timers: any;

    constructor() {
        this._timers = {};
    }

    private sprintf(message: any) {
        //  discuss at: http://phpjs.org/functions/sprintf/
        // original by: Ash Searle (http://hexmen.com/blog/)
        // improved by: Michael White (http://getsprink.com)
        // improved by: Jack
        // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // improved by: Dj
        // improved by: Allidylls
        //    input by: Paulo Freitas
        //    input by: Brett Zamir (http://brett-zamir.me)
        //   example 1: sprintf("%01.2f", 123.1);
        //   returns 1: 123.10
        //   example 2: sprintf("[%10s]", 'monkey');
        //   returns 2: '[    monkey]'
        //   example 3: sprintf("[%'#10s]", 'monkey');
        //   returns 3: '[####monkey]'
        //   example 4: sprintf("%d", 123456789012345);
        //   returns 4: '123456789012345'
        //   example 5: sprintf('%-03s', 'E');
        //   returns 5: 'E00'

        var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g;
        var a = arguments;
        var i = 0;
        var format = a[i++];

        // pad()
        var pad = function (str, len, chr, leftJustify) {
            if (!chr) {
                chr = ' ';
            }
            var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0)
                .join(chr);
            return leftJustify ? str + padding : padding + str;
        };

        // justify()
        var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar?) {
            var diff = minWidth - value.length;
            if (diff > 0) {
                if (leftJustify || !zeroPad) {
                    value = pad(value, minWidth, customPadChar, leftJustify);
                } else {
                    value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
                }
            }
            return value;
        };

        // formatBaseX()
        var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
            // Note: casts negative numbers to positive ones
            var number = value >>> 0;
            prefix = prefix && number && {
                '2': '0b',
                '8': '0',
                '16': '0x'
            }[base] || '';
            value = prefix + pad(number.toString(base), precision || 0, '0', false);
            return justify(value, prefix, leftJustify, minWidth, zeroPad);
        };

        // formatString()
        var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar?) {
            if (precision != null) {
                value = value.slice(0, precision);
            }
            return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
        };

        // doFormat()
        var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
            var number, prefix, method, textTransform, value;

            if (substring === '%%') {
                return '%';
            }

            // parse flags
            var leftJustify = false;
            var positivePrefix = '';
            var zeroPad = false;
            var prefixBaseX = false;
            var customPadChar = ' ';
            var flagsl = flags.length;
            for (var j = 0; flags && j < flagsl; j++) {
                switch (flags.charAt(j)) {
                    case ' ':
                        positivePrefix = ' ';
                        break;
                    case '+':
                        positivePrefix = '+';
                        break;
                    case '-':
                        leftJustify = true;
                        break;
                    case "'":
                        customPadChar = flags.charAt(j + 1);
                        break;
                    case '0':
                        zeroPad = true;
                        customPadChar = '0';
                        break;
                    case '#':
                        prefixBaseX = true;
                        break;
                }
            }

            // parameters may be null, undefined, empty-string or real valued
            // we want to ignore null, undefined and empty-string values
            if (!minWidth) {
                minWidth = 0;
            } else if (minWidth === '*') {
                minWidth = +a[i++];
            } else if (minWidth.charAt(0) == '*') {
                minWidth = +a[minWidth.slice(1, -1)];
            } else {
                minWidth = +minWidth;
            }

            // Note: undocumented perl feature:
            if (minWidth < 0) {
                minWidth = -minWidth;
                leftJustify = true;
            }

            if (!isFinite(minWidth)) {
                throw new Error('sprintf: (minimum-)width must be finite');
            }

            if (!precision) {
                precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined;
            } else if (precision === '*') {
                precision = +a[i++];
            } else if (precision.charAt(0) == '*') {
                precision = +a[precision.slice(1, -1)];
            } else {
                precision = +precision;
            }

            // grab value using valueIndex if required?
            value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

            switch (type) {
                case 's':
                    return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
                case 'c':
                    return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
                case 'b':
                    return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'o':
                    return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'x':
                    return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'X':
                    return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
                        .toUpperCase();
                case 'u':
                    return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'i':
                case 'd':
                    number = +value || 0;
                    // Plain Math.round doesn't just truncate
                    number = Math.round(number - number % 1);
                    prefix = number < 0 ? '-' : positivePrefix;
                    value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                    return justify(value, prefix, leftJustify, minWidth, zeroPad);
                case 'e':
                case 'E':
                case 'f': // Should handle locales (as per setlocale)
                case 'F':
                case 'g':
                case 'G':
                    number = +value;
                    prefix = number < 0 ? '-' : positivePrefix;
                    method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                    textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                    value = prefix + Math.abs(number)[method](precision);
                    return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
                default:
                    return substring;
            }
        };

        return format.replace(regex, doFormat);
    }

    private formatParams(message: any): string {
        if (arguments.length <= 1) {
            return message ? message : '';
        }
        var res = this.sprintf.apply(this, arguments);
        if (res === message) {
            // we have more params but no format
            var args = Array.prototype.slice.call(arguments);
            return args.join(' ');
        }
        return res;
    }

    public time(reportName: string): void {
        var name = reportName ? '__' + reportName : '__internal_console_time__';
        if (('undefined' === typeof (this._timers[name])) || (this._timers.hasOwnProperty(name))) {
            this._timers[name] = helperModule.timeMillis();
        }
        else {
            this.warn('invalid name for timer console.time(' + reportName + ')');
        }
    }

    public timeEnd(reportName: string): void {
        var name = reportName ? '__' + reportName : '__internal_console_time__';
        if (this._timers.hasOwnProperty(name)) {
            var val = this._timers[name];
            if (val) {
                var time = helperModule.timeMillis();
                this.info('console.time(' + reportName + '): %.6f ms', (time - val));
                this._timers[name] = undefined;
            }
            else {
                this.warn('undefined console.time(' + reportName + ')');
            }
        }
    }

    public assert(test: boolean, message: string, ...formatParams: any[]): void {
        if (!test) {
            Array.prototype.shift.apply(arguments);
            helperModule.error(this.formatParams.apply(this, arguments));

            // duplicating trace code here because android version shows only 2 frames and if we call trace()
            // this would be assert() and trace() which leaves all important stack frames out of our view

            //this._nativeClass.log('=== trace(): JS stack ===')
            //if (i.TargetOS.Android == targetOS) {
            //    var e = <any>new Error('console.trace()');
            //    this.log(e.stack);
            //}
            //else if (i.TargetOS.iOS == targetOS) {
            //    var callstack = [];
            //    var currentFunction = arguments.callee.caller;
            //    while (currentFunction) {
            //        var fn = currentFunction.toString();
            //        var fname = fn.substring(fn.indexOf('function') + 8, fn.indexOf('{')).trim() || 'anonymous';
            //        if ('()' === fname) {
            //            fname = 'anonymous';
            //        }
            //        callstack.push(fname);
            //        currentFunction = currentFunction.caller;
            //        this.log(callstack.join('\n'));
            //    }
            //}
        }
    }

    public info(message: any, ...formatParams: any[]): void {
        helperModule.info(this.formatParams.apply(this, arguments));
    }

    public warn(message: any, ...formatParams: any[]): void {
        helperModule.warn(this.formatParams.apply(this, arguments));
    }

    public error(message: any, ...formatParams: any[]): void {
        helperModule.error(this.formatParams.apply(this, arguments));
    }

    public log(message: any, ...formatParams: any[]): void {
        helperModule.helper_log(this.formatParams.apply(this, arguments));
    }

    public trace(): void {
        var callstack = [];
        var currentFunction = arguments.callee.caller;
        while (currentFunction) {
            var fn = currentFunction.toString();
            var fname = fn.substring(fn.indexOf('function') + 8, fn.indexOf('{')).trim() || 'anonymous';
            if ('()' === fname) {
                fname = 'anonymous';
            }
            callstack.push(fname);
            currentFunction = currentFunction.caller;
            this.log(callstack.join('\n'));
        }
    }

    public dump(obj: any): void {
        if (null == obj) {
            this.log("=== dump(): object is 'null' ===");
            return;
        }
        if ("undefined" == typeof obj) {
            this.log("=== dump(): object is 'undefined' ===");
            return;
        }
        var result = ['=== dump(): dumping members ==='];
        result.push(JSON.stringify(obj, null, 4));
        result.push('=== dump(): dumping function names ===');
        for (var id in obj) {
            try {
                if (typeof (obj[id]) == 'function') {
                    result.push(id + '()');
                }
            } catch (err) {
                result.push(id + ': inaccessible');
            }
        }
        result.push('=== dump(): finished ===');
        this.log(result.join('\n'));
    }
}