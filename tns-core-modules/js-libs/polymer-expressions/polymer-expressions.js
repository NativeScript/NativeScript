// Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
// This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
// The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
// The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
// Code distributed by Google as part of the polymer project is also
// subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt

// Hack to resolve https://github.com/webpack/enhanced-resolve/issues/197 . 
// This issue causes an require like this (`../esprima`) to be resolved to (`esprima`) by the Angular webpack plugin
var esprima = require("../../js-libs/esprima").esprima;

var Path = require("./path-parser").Path;

(function (global) {
    'use strict';

    // TODO(rafaelw): Implement simple LRU.
    var expressionParseCache = Object.create(null);

    function getExpression(expressionText) {
        var expression = expressionParseCache[expressionText];
        if (!expression) {
            var delegate = new ASTDelegate();
            esprima.parse(expressionText, delegate);
            expression = new Expression(delegate);
            expressionParseCache[expressionText] = expression;
        }
        return expression;
    }

    function Literal(value) {
        this.value = value;
        this.valueFn_ = undefined;
    }

    Literal.prototype = {
        valueFn: function () {
            if (!this.valueFn_) {
                var value = this.value;
                this.valueFn_ = function () {
                    return value;
                }
            }

            return this.valueFn_;
        }
    }

    function IdentPath(name) {
        this.name = name;
        this.path = Path.get(name);
    }

    IdentPath.prototype = {
        valueFn: function () {
            if (!this.valueFn_) {
                var name = this.name;
                var path = this.path;
                this.valueFn_ = function (model, observer, changedModel) {
                    if (observer)
                        observer.addPath(model, path);

                    if (changedModel) {
                        var result = path.getValueFrom(changedModel);
                        if (result !== undefined) {
                            return result;
                        }
                    }

                    return path.getValueFrom(model);
                }
            }

            return this.valueFn_;
        },

        setValue: function (model, newValue) {
            if (this.path.length == 1) {
                model = findScope(model, this.path[0]);
            }

            return this.path.setValueFrom(model, newValue);
        }
    };

    function MemberExpression(object, property, accessor) {
        this.computed = accessor == '[';

        this.dynamicDeps = typeof object == 'function' ||
                           object.dynamicDeps ||
                           (this.computed && !(property instanceof Literal));

        this.simplePath =
            !this.dynamicDeps &&
            (property instanceof IdentPath || property instanceof Literal) &&
            (object instanceof MemberExpression || object instanceof IdentPath);

        this.object = this.simplePath ? object : getFn(object);
        this.property = !this.computed || this.simplePath ?
            property : getFn(property);
    }

    MemberExpression.prototype = {
        get fullPath() {
            if (!this.fullPath_) {

                var parts = this.object instanceof MemberExpression ?
                    this.object.fullPath.slice() : [this.object.name];
                parts.push(this.property instanceof IdentPath ?
                    this.property.name : this.property.value);
                this.fullPath_ = Path.get(parts);
            }

            return this.fullPath_;
        },

        valueFn: function () {
            if (!this.valueFn_) {
                var object = this.object;

                if (this.simplePath) {
                    var path = this.fullPath;

                    this.valueFn_ = function (model, observer) {
                        if (observer)
                            observer.addPath(model, path);

                        return path.getValueFrom(model);
                    };
                } else if (!this.computed) {
                    var path = Path.get(this.property.name);

                    this.valueFn_ = function (model, observer, filterRegistry) {
                        var context = object(model, observer, filterRegistry);

                        if (observer)
                            observer.addPath(context, path);

                        return path.getValueFrom(context);
                    }
                } else {
                    // Computed property.
                    var property = this.property;

                    this.valueFn_ = function (model, observer, filterRegistry) {
                        var context = object(model, observer, filterRegistry);
                        var propName = property(model, observer, filterRegistry);
                        if (observer)
                            observer.addPath(context, [propName]);

                        return context ? context[propName] : undefined;
                    };
                }
            }
            return this.valueFn_;
        },

        setValue: function (model, newValue) {
            if (this.simplePath) {
                this.fullPath.setValueFrom(model, newValue);
                return newValue;
            }

            var object = this.object(model);
            var propName = this.property instanceof IdentPath ? this.property.name :
                this.property(model);
            return object[propName] = newValue;
        }
    };

    function Filter(name, args) {
        this.name = name;
        this.args = [];
        for (var i = 0; i < args.length; i++) {
            this.args[i] = getFn(args[i]);
        }
    }

    Filter.prototype = {
        transform: function (model, observer, filterRegistry, toModelDirection,
                            initialArgs) {
            var fn = filterRegistry[this.name];
            var context = model;
            if (fn) {
                context = undefined;
            } else {
                fn = context[this.name];
                if (!fn) {
                    console.error('Cannot find function or filter: ' + this.name);
                    return;
                }
            }

            // If toModelDirection is falsey, then the "normal" (dom-bound) direction
            // is used. Otherwise, it looks for a 'toModel' property function on the
            // object.
            if (toModelDirection) {
                fn = fn.toModel;
            } else if (typeof fn.toView == 'function') {
                fn = fn.toView;
            }

            if (typeof fn != 'function') {
                console.error('Cannot find function or filter: ' + this.name);
                return;
            }

            var args = initialArgs || [];
            for (var i = 0; i < this.args.length; i++) {
                args.push(getFn(this.args[i])(model, observer, filterRegistry));
            }

            return fn.apply(context, args);
        }
    };

    function notImplemented() { throw Error('Not Implemented'); }

    var unaryOperators = {
        '+': function (v) { return +v; },
        '-': function (v) { return -v; },
        '!': function (v) { return !v; }
    };

    var binaryOperators = {
        '+': function (l, r) { return l + r; },
        '-': function (l, r) { return l - r; },
        '*': function (l, r) { return l * r; },
        '/': function (l, r) { return l / r; },
        '%': function (l, r) { return l % r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        '==': function (l, r) { return l == r; },
        '!=': function (l, r) { return l != r; },
        '===': function (l, r) { return l === r; },
        '!==': function (l, r) { return l !== r; },
        '&&': function (l, r) { return l && r; },
        '||': function (l, r) { return l || r; },
    };

    function getFn(arg) {
        return typeof arg == 'function' ? arg : arg.valueFn();
    }

    function ASTDelegate() {
        this.expression = null;
        this.filters = [];
        this.deps = {};
        this.currentPath = undefined;
        this.scopeIdent = undefined;
        this.indexIdent = undefined;
        this.dynamicDeps = false;
    }

    ASTDelegate.prototype = {
        createUnaryExpression: function (op, argument) {
            if (!unaryOperators[op])
                throw Error('Disallowed operator: ' + op);

            argument = getFn(argument);

            return function (model, observer, filterRegistry) {
                return unaryOperators[op](argument(model, observer, filterRegistry));
            };
        },

        createBinaryExpression: function (op, left, right) {
            if (!binaryOperators[op])
                throw Error('Disallowed operator: ' + op);

            left = getFn(left);
            right = getFn(right);

            switch (op) {
                case '||':
                    this.dynamicDeps = true;
                    return function (model, observer, filterRegistry) {
                        return left(model, observer, filterRegistry) ||
                            right(model, observer, filterRegistry);
                    };
                case '&&':
                    this.dynamicDeps = true;
                    return function (model, observer, filterRegistry) {
                        return left(model, observer, filterRegistry) &&
                            right(model, observer, filterRegistry);
                    };
            }

            return function (model, observer, filterRegistry) {
                return binaryOperators[op](left(model, observer, filterRegistry),
                                           right(model, observer, filterRegistry));
            };
        },

        createConditionalExpression: function (test, consequent, alternate) {
            test = getFn(test);
            consequent = getFn(consequent);
            alternate = getFn(alternate);

            this.dynamicDeps = true;

            return function (model, observer, filterRegistry) {
                return test(model, observer, filterRegistry) ?
                    consequent(model, observer, filterRegistry) :
                    alternate(model, observer, filterRegistry);
            }
        },

        createIdentifier: function (name) {
            var ident = new IdentPath(name);
            ident.type = 'Identifier';
            return ident;
        },

        createMemberExpression: function (accessor, object, property) {
            var ex = new MemberExpression(object, property, accessor);
            if (ex.dynamicDeps)
                this.dynamicDeps = true;
            return ex;
        },

        createCallExpression: function (expression, args) {
            if (!(expression instanceof IdentPath))
                throw Error('Only identifier function invocations are allowed');

            var filter = new Filter(expression.name, args);

            return function (model, observer, filterRegistry) {
                return filter.transform(model, observer, filterRegistry, false);
            };
        },

        createLiteral: function (token) {
            return new Literal(token.value);
        },

        createArrayExpression: function (elements) {
            for (var i = 0; i < elements.length; i++)
                elements[i] = getFn(elements[i]);

            return function (model, observer, filterRegistry) {
                var arr = []
                for (var i = 0; i < elements.length; i++)
                    arr.push(elements[i](model, observer, filterRegistry));
                return arr;
            }
        },

        createProperty: function (kind, key, value) {
            return {
                key: key instanceof IdentPath ? key.name : key.value,
                value: value
            };
        },

        createObjectExpression: function (properties) {
            for (var i = 0; i < properties.length; i++)
                properties[i].value = getFn(properties[i].value);

            return function (model, observer, filterRegistry) {
                var obj = {};
                for (var i = 0; i < properties.length; i++)
                    obj[properties[i].key] =
                        properties[i].value(model, observer, filterRegistry);
                return obj;
            }
        },

        createFilter: function (name, args) {
            this.filters.push(new Filter(name, args));
        },

        createAsExpression: function (expression, scopeIdent) {
            this.expression = expression;
            this.scopeIdent = scopeIdent;
        },

        createInExpression: function (scopeIdent, indexIdent, expression) {
            this.expression = expression;
            this.scopeIdent = scopeIdent;
            this.indexIdent = indexIdent;
        },

        createTopLevel: function (expression) {
            this.expression = expression;
        },

        createThisExpression: notImplemented
    }

    function Expression(delegate) {
        this.scopeIdent = delegate.scopeIdent;
        this.indexIdent = delegate.indexIdent;

        if (!delegate.expression)
            throw Error('No expression found.');

        this.expression = delegate.expression;
        getFn(this.expression); // forces enumeration of path dependencies

        this.filters = delegate.filters;
        this.dynamicDeps = delegate.dynamicDeps;
    }

    Expression.prototype = {
        getValue: function (model, isBackConvert, changedModel, observer) {
            var value = getFn(this.expression)(model.context, observer, changedModel);
            for (var i = 0; i < this.filters.length; i++) {
                value = this.filters[i].transform(model.context, observer, model.context, isBackConvert, [value]);
            }

            return value;
        },

        setValue: function (model, newValue, filterRegistry) {
            var count = this.filters ? this.filters.length : 0;
            while (count-- > 0) {
                newValue = this.filters[count].transform(model, undefined,
                    filterRegistry, true, [newValue]);
            }

            if (this.expression.setValue)
                return this.expression.setValue(model, newValue);
        }
    }

    /**
     * Converts a style property name to a css property name. For example:
     * "WebkitUserSelect" to "-webkit-user-select"
     */
    function convertStylePropertyName(name) {
        return String(name).replace(/[A-Z]/g, function (c) {
            return '-' + c.toLowerCase();
        });
    }

    var parentScopeName = '@' + Math.random().toString(36).slice(2);

    // Single ident paths must bind directly to the appropriate scope object.
    // I.e. Pushed values in two-bindings need to be assigned to the actual model
    // object.
    function findScope(model, prop) {
        while (model[parentScopeName] &&
               !Object.prototype.hasOwnProperty.call(model, prop)) {
            model = model[parentScopeName];
        }

        return model;
    }

    function isLiteralExpression(pathString) {
        switch (pathString) {
            case '':
                return false;

            case 'false':
            case 'null':
            case 'true':
                return true;
        }

        if (!isNaN(Number(pathString)))
            return true;

        return false;
    };

    function PolymerExpressions() { }

    PolymerExpressions.prototype = {
        // "built-in" filters
        styleObject: function (value) {
            var parts = [];
            for (var key in value) {
                parts.push(convertStylePropertyName(key) + ': ' + value[key]);
            }
            return parts.join('; ');
        },

        tokenList: function (value) {
            var tokens = [];
            for (var key in value) {
                if (value[key])
                    tokens.push(key);
            }
            return tokens.join(' ');
        },

        // binding delegate API
        prepareInstancePositionChanged: function (template) {
            var indexIdent = template.polymerExpressionIndexIdent_;
            if (!indexIdent)
                return;

            return function (templateInstance, index) {
                templateInstance.model[indexIdent] = index;
            };
        },

        prepareInstanceModel: function (template) {
            var scopeName = template.polymerExpressionScopeIdent_;
            if (!scopeName)
                return;

            var parentScope = template.templateInstance ?
                template.templateInstance.model :
                template.model;

            var indexName = template.polymerExpressionIndexIdent_;

            return function (model) {
                return createScopeObject(parentScope, model, scopeName, indexName);
            };
        }
    };

    var createScopeObject = ('__proto__' in {}) ?
      function (parentScope, model, scopeName, indexName) {
          var scope = {};
          scope[scopeName] = model;
          scope[indexName] = undefined;
          scope[parentScopeName] = parentScope;
          scope.__proto__ = parentScope;
          return scope;
      } :
      function (parentScope, model, scopeName, indexName) {
          var scope = Object.create(parentScope);
          Object.defineProperty(scope, scopeName,
              { value: model, configurable: true, writable: true });
          Object.defineProperty(scope, indexName,
              { value: undefined, configurable: true, writable: true });
          Object.defineProperty(scope, parentScopeName,
              { value: parentScope, configurable: true, writable: true });
          return scope;
      };

    global.PolymerExpressions = PolymerExpressions;
    PolymerExpressions.getExpression = getExpression;
})(module.exports);