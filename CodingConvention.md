#TSN-Modules Coding Convention#

##Linting

*TODO: We should further verify this may work with TypeScript*

Linting is the process of running a program that will analyse code for potential errors.

For Visual Studio use this [extension][vsjslint] with JsHint mode. Settings can be imported from [here][jslintsettings]

For WebStrom set it JsHint in Settings > JavaScript > Code Quality Tools.

Following rules should be applied.
~~~ {.javascript}
/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, unused:true, strict:true, indent:4, quotmark:single, node:true */
~~~

[linting]:http://stackoverflow.com/questions/8503559/what-is-linting
[vsjslint]:http://visualstudiogallery.msdn.microsoft.com/1a417c37-4d6f-43ca-b753-6ea6eb5041fd
[jslintsettings]:https://github.com/telerik/everlive/blob/master/CodeConventions/JSLintSettings.xml


## Tabs vs Spaces

Use 4 spaces indentation.
+ Visual Studio:  Options > Text Editor > JavaScript > Tabs. Indenting: Smart tabs; Tab: Indent Size: 4, Insert Tabs: checked. This is the default Visual Studio set up
+ JetBrains WebStorm: Settings > Code Style > JavaScript > Use tab: unchecked. All other tam settings to 4


## Line length

Try to limit your lines to 80 characters.

## Semicolons, statement Termination

Always use semicolons where it is appropriate.

*Right:*

~~~ {.javascript}
var x = 1;
~~~

*Wrong:*

~~~ {.javascript}
var x = 1
~~~


## Quotes

Use single quotes, unless you are writing JSON.

*Right:*

~~~ {.javascript}
var foo = "bar";
~~~

*Wrong:*

~~~ {.javascript}
var foo = 'bar';
~~~

## Braces

Your opening braces go on the same line as the statement.

*Right:*

~~~ {.javascript}
if (true) {
    console.log('winning');
}
~~~

*Wrong:*

~~~ {.javascript}
if (true)
{
    console.log('losing');
}
~~~

Also, notice the use of whitespace before and after the condition statement.

Follow the JavaScript convention of stacking `else/catch` clauses on the same line as the previous closing brace.

*Right:*

~~~ {.javascript}
if (i % 2 === 0) {
    console.log('even');
} else {
    console.log('odd');
}
~~~

*Wrong:*

~~~ {.javascript}
if (i % 2 === 0) {
    console.log('even');
}
else {
    console.log('odd');
}
~~~

## Variable declarations

Declare one variable per var statement. Try to put those declarations at the beginning of each scope.

**NOTE:** Loops DO NOT create new scopes so declare iteration vars outside the loop.

*Right:*

~~~ {.javascript}
var keys = ['foo', 'bar'];
var values = [23, 42];
var key;
var object = {};

while (items.length) {
    key = keys.pop();
    object[key] = values.pop();
}

//---------------------------

var i;
for (i = 0; i < items.length; i++) {
    // do something
}
~~~

*Wrong:*

~~~ {.javascript}
var keys = ['foo', 'bar'],
    values = [23, 42],
    object = {};

while (items.length) {
    var key = keys.pop();
    object[key] = values.pop();
}

//---------------------------

for (var i = 0; i < items.length; i++) {
    // one may assume the "i" var is local for the loop while it is NOT
}
~~~

## Variable and property names

Variables and properties should use [lower camel case][camelcase]
capitalization. They should also be descriptive. Single character variables and
uncommon abbreviations should generally be avoided unless it is something well known as **i** in for loops

*Right:*

~~~ {.javascript}
var adminUser = db.query('SELECT * FROM users ...');
~~~

*Wrong:*

~~~ {.javascript}
var admin_user = db.query('SELECT * FROM users ...');
~~~

[camelcase]: http://en.wikipedia.org/wiki/camelCase#Variations_and_synonyms

## Type names

Type names should be capitalized using [upper camel case][camelcase].

*Right:*

~~~ {.javascript}
function UserAccount() {
  this.field = 'a';
}
~~~

*Wrong:*

~~~ {.javascript}
function userAccount() {
  this.field = 'a';
}
~~~

## Constants

Constants should be declared with CAPITAL letters. If the constants will be used in more than one module put them in a separate file. Use underscore to name constants with complex wording.

*Right:*

~~~ {.javascript}
var SECOND = 1 * 1000;
var MY_SECOND = SECOND;
~~~

*Wrong:*

~~~ {.javascript}
var second = 1 * 1000;
~~~

## Object / Array creation

Use trailing commas and put *short* declarations on a single line. Only quote
keys when your interpreter complains:

*Right:*

~~~ {.javascript}
var a = ['hello', 'world'];
var b = {
  good: 'code',
  'is generally': 'pretty',
};
~~~

*Wrong:*

~~~ {.javascript}
var a = [
  'hello', 'world'
];
var b = {"good": 'code'
        , is generally: 'pretty'
        };
~~~

## Long Arrays

*Right:*

~~~ {.javascript}
var a = [
     “this”,
     “is”,
     “a”,
     “very”,
     “long”,
     “array”,
     “declaration”,
     “for”,
     “hello”,
     “world” + HOW ABOUT THE ENDING commas?
];
~~~

## Equality operator

Use the [strict comaprison operators][comparisonoperators]. The triple equality operator helps to maintain data type integrity throughout code.

*Right:*

~~~ {.javascript}
var a = 0;
if (a === '') {
    console.log('winning');
}

~~~

*Wrong:*

~~~ {.javascript}
var a = 0;
if (a == '') {
    console.log('losing');
}
~~~

[comparisonoperators]: https://developer.mozilla.org/en/JavaScript/Reference/Operators/Comparison_Operators

##Short-hand oprators
Try to avoid short-hand operators except in very simple scenarios.
*Right:*

~~~ {.javascript}
var default = x || 50;
var extraLarge = 'xxl';
var small = 's'
var big = (x > 10) ? extraLarge : small;
~~~

*Wrong:*

~~~ {.javascript}
var default = checkX(x) || getDefaultSize();
var big = (x > 10) ? checkX(x)?getExtraLarge():getDefaultSize():getSmallValue();
~~~


##Curly braces 
Always use curly braces even in the cases of one line conditional operations.

*Right:*

~~~ {.javascript}
if (a) {
    return 'winning';
}

~~~

*Wrong:*

~~~ {.javascript}

if (a)
    return 'winning';

if (a) return 'winning';
~~~

##Boolean comparisons
**Do not** directly compare with true, or false.

*Right:*

~~~ {.javascript}

if(condition) {
    console.log('winning');
}

if (!condition) {
    console.log('winning');
}

~~~

*Wrong:*

~~~ {.javascript}

if(condition === true) {
    console.log('losing');
}

if(condition !== true) {
    console.log('losing');
}

if(condition !== false) {
    console.log('losing');
}

~~~

## Boolean conditions format
Do not use the **Yoda Conditions** when writing boolean expressions:

> “Yoda Conditions” — the act of using 
> if(constant == variable) **instead of** 
> if(variable == constant), like if(4 == foo).
> Because it’s like saying “if blue is the sky” or “if tall is the man”.

*Right:*

~~~ {.javascript}
var num;
if(num >= 0) {
    console.log('winning');
}
~~~

*Wrong:*

~~~ {.javascript}
var num;
if(0 <= num) {
    console.log('losing');
}
~~~

**NOTE** It is OK to use constants on the left when comparing for a range.
~~~ {.javascript}
if(0 <= num && num <= 100) {
    console.log('winning');
}
~~~

## Function length

Keep your functions short. A good function fits on a slide that the people in
the last row of a big room can comfortably read. So don't count on them having
perfect vision and limit yourself to 1/2 of your screen height per function (no screen rotation :).

## Return statements
There are few important considerations here:
+ To avoid deep nesting of if-statements, always return a functions value as early
as possible. In certain routines, once you know the answer, you want to return it to the calling routine immediately. If the routine is defined in such a way that it doesn't require any cleanup, not returning immediately means that you have to write more code.
+ Minimize the number of returns in each routine. It's harder to understand a routine if, reading it at the bottom, you're unaware of the possibility that it *return*ed somewhere above.

*Right:*

~~~ {.javascript}
function getSomething(val) {
    if (val < 0) {
        return false;
    }

    if (val > 100) {
        return false;
    }

    var res1 = doOne();
    var res2 = doTwo();
    var options = {
        a: 1,
        b: 2
    };
    var result = doThree(res1, res2, options);
    return result;
}
~~~

*Wrong:*

~~~ {.javascript}
function getSomething(val) {
    if (val >= 0) {
        if (val < 100) {
            var res1 = doOne();
            var res2 = doTwo();
            var options = {
                             a: 1,
                             b: 2
                          };
            var result = doThree(res1, res2, options);
            return result;    
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}
~~~

## Globals
Avoid using globals. If you need to store a varable as a global make sure that this happens during the bootstrapping of the application. If your code uses globals, please either put them in the begininng of the file using the jsHint convention:

~~~ {.javascript}
/* global Logger, Constants, Everlive */
~~~
or use the *global* prefix:

~~~ {.javascript}
global.Logger.log('a');
~~~

## TS Lambdas

Avoid using TS Lambdas. Exception is when the function is one-line and DOES NOT use the "this" object.

*Right:*

~~~ {.javascript}
req.on('end', () => { console.log('winning'); });

//------
var that = this;
req.on("end", function () {
    exp1();
    exp2();
    that.doSomething();
});

~~~

*Wrong:*

~~~ {.javascript}
req.on("end", () => {
    exp1();
    exp2();
    this.doSomething();
});
~~~

## Nested Closures

Prefer closures nested NO MORE than 2 levels. Still, this is more a common sense.

*Right:*

~~~ {.javascript}
setTimeout(function() {
  client.connect(afterConnect);
}, 1000);

function afterConnect() {
  console.log('winning');
}
~~~

*Wrong:*

~~~ {.javascript}
setTimeout(function() {
  client.connect(function() {
    console.log('losing');
  });
}, 1000);
~~~

## Promises

Wrap every asyncronous method in promises rather than callbacks.

*Right:*

~~~ {.javascript}
function doAsync(arg) {
    var d = promises.defer();

    // make the async call
    async.call(arg, function onSuccess() {
        d.resolve();
    }, function onError() {
        d.reject();
    });

    return d.promise();
}
~~~

*Wrong:*

~~~ {.javascript}
function doAsync(arg, onSuccess, onError) {
    async.call(arg, onSuccess, onError);
}
~~~

##Comments
Use the [JSDoc][JSDOC] convention for comments. When writing a comment always think how understandable will be for somebody who is new to this code. Even if it may look simple to you think how a guy that just joined will understand it. Always comment in the following cases:
+ When there is some non-trivial logic.
+ Some 'external' knowledge is needed which is missing in the context - workaround for driver, module bug, special 'hack' because of a bug and so on;
+ When you are creating a new class
+ Public methods - include all the arguments and if possible the types {String}, {Number}. Optional arguments should be marked too. Check the [@param tag][param]

[JSDOC]: http://usejsdoc.org/
[param]: http://usejsdoc.org/tags-param.html


##Commenting of parameters that are objects/complex types
When you have parameters that are complex objexts like *options* or other type for which the properties are not clear or is external one use the [@type-def tag][typedef]

*Right:*

~~~ {.javascript}
/**
 * @typedef PropertiesHash
 * @type {object}
 * @property {string} id - an ID.
 * @property {string} name - your name.
 * @property {number} age - your age.
 */

/** 
 * @param {PropertiesHash} properties
 */
function checkProperties(properties) {
    if(!properties.id) {
        return false;
    }
}
~~~

*Wrong:*
~~~ {.javascript}
/** 
 * @param properties
 */
function checkProperties(properties) {
    if(!properties.id) {
        return false;
    }
}
~~~


[typedef]: http://usejsdoc.org/tags-typedef.html

##File/module structure
Typical module should have the following structure:

1. required dependencies
2. module-private declarations - variables, functions, classes, etc.
3. export variables and functions
4. export class declarations

For more information see [this file](https://github.com/telerik/xPlatCore/blob/master/JS/BCL/CreateNewModule.md)

## File naming
Use lower case for file names. Use dash to separate different words.

*Right:*
file-system

*Wrong:*
FileSystem, fileSystem, file_system

## This, that, self
When you need to keep reference to **this** use **that** as the name of the variable. Additionally, if you use the TypeScript lambda support, the compiler will take care of this automatically. The tricky part here is that it outputs **_this** which is not compliant with our convention.

*Right:*
~~~ {.javascript}
var that = this;
doSomething(function(){
    that.doNothing();
});
~~~

*Wrong:*
~~~ {.javascript}
var me = this;
doSomething(function(){
    me.doNothing();
});
~~~

## Private (hidden) variables and methods
Although there is the **private** keyword in TypeScript, it is only a syntax sugar. There is no such notation in JavaScript and everything is available to the users. Hence, always use underscore (**_**) to prefix private variables and methods. There are also methods which have the **public** visibility but they are meant to be used within our code ONLY. Such methods should also be prefixed with underscore.

*Right:*
~~~ {.javascript}
class Foo {
    private _myBoolean: boolean;
    
    public publicAPIMethod() {
    }
    
    public _frameworkMethod() {
        // this method is for internal use only
    }
    
    private _doSomething() {
    }
}
~~~

*Wrong:*
~~~ {.javascript}
class Foo {
    private myBoolean: boolean;
    
    public _publicAPIMethod() {
    }
    
    public frameworkMethod() {
        // this method is for internal use only
    }
    
    private doSomething() {
    }
}
~~~

## Falsy values vs. null and undefined
When possible use the falsy comparison vs. comparison with null or undefined.

*Right:*
~~~ {.javascript}
var myVar = undefined;
if(myVar) {
    // myVar is defined
}
~~~

*Wrong:*
~~~ {.javascript}
var myVar = undefined;
if(typeof myVar === 'undefined') {
}
~~~

## Type comparison
Sometimes we need to explicitly check for a type. In such cases use the built-in module **"types"**.

*Right:*
~~~ {.javascript}
import types = require("utils/types");
var myVar;

if(types.isString(myVar)) {
    // myVar is of type String
}
~~~

*Wrong:*
~~~ {.javascript}
var myVar = undefined;
if(typeof myVar === 'string') {
}
~~~

## TypeScript optional parameters
**Do not** use optional parameters in IMPLEMENTATION files. This is because the TS compiler generates additional array and populates its from the **arguments** object. Still, it is OK to use these in a definition file (as declarations ONLY).

*Right:*
~~~ {.javascript}
// declaration
export declare function concat(...categories: string[]): string;

// implementation
export function concat(): string {
    var i;
    var result: string;
    // use the arguments object to iterate the parameters
    for (i = 0; i < arguments.length; i++) {
        // do something
    }

    return result;
}
~~~

*Wrong:*
~~~ {.javascript}
// declaration
export declare function concat(...categories: string[]): string;

// implementation
export function concat(...categories: string[]): string {
    var i;
    var result: string;
    // use the arguments object to iterate the parameters
    for (i = 0; i < categories.length; i++) {
        // do something
    }

    return result;
}
~~~

## (**SUGGESTION**) TypeScript function variable names
Name your function variables with the **Func** suffix. The reader will immediately know that this variable is a function when he sees it.

*Right:*
~~~ {.javascript}
var eachChildFunc = function eachChildFunc(child: View): boolean {
    child.onUnloaded();
    return true;
}
this._eachChildView(eachChildFunc);
~~~

*Wrong:*
~~~ {.javascript}
var eachChild = function (child: View): boolean {
    child.onUnloaded();
    return true;
}
this._eachChildView(eachChild);
~~~

## Naming test functions
Name your test function with test_ so that our test runner can find them and add 'underscore' tested method/property name. Different words should be capitalized (and optionally separated by 'underscore').

*Right:*
~~~ {.javascript}
export var test_goToVisualState_NoState_ShouldResetStyledProperties = function () {
    // Test code here.
}
~~~
