# NativeScript Modules Coding Convention

## Linting

We use [TSLint](https://palantir.github.io/tslint/) for linting. Rules are defined in `build/tslint.json`.
Run the tslint from the root of the repo with:

```bash
npm run tslint
```

## Tabs vs Spaces

Use 4 spaces indentation.

## Line length

Try to limit your lines to 80 characters.

## Semicolons, statement Termination

Always use semicolons where it is appropriate.

*Right:*

```TypeScript
let x = 1;
```

*Wrong:*

```TypeScript
let x = 1
```

## Quotes

Use double quotes for strings:

*Right:*

```TypeScript
let foo = "bar";
```

*Wrong:*

```TypeScript
let foo = 'bar';
```

## Braces

Your opening braces go on the same line as the statement.

*Right:*

```TypeScript
if (true) {
    console.log("winning");
}
```

*Wrong:*

```TypeScript
if (true)
{
    console.log("losing");
}
```

Also, notice the use of whitespace before and after the condition statement.

Follow the JavaScript convention of stacking `else/catch` clauses on the same line as the previous closing brace.

*Right:*

```TypeScript
if (i % 2 === 0) {
    console.log("even");
} else {
    console.log("odd");
}
```

*Wrong:*

```TypeScript
if (i % 2 === 0) {
    console.log("even");
}
else {
    console.log("odd");
}
```

## Variable declarations

Declare variables with `let` instead of `var`. Use `const` when possible.

*Right:*

```TypeScript
const button = new Button();

for (let i = 0; i < items.length; i++) {
    // do something
}
```

*Wrong:*

```TypeScript
var button = new Button();

for (var i = 0; i < items.length; i++) {
    // do something
}

```

## Variable and property names

Variables and properties should use [lower camel case][camelcase]
capitalization. They should also be descriptive. Single character variables and
uncommon abbreviations should generally be avoided unless it is something well known as **i** in for loops

*Right:*

```TypeScript
let adminUser = db.query("SELECT * FROM users ...");
```

*Wrong:*

```TypeScript
let admin_user = db.query("SELECT * FROM users ...");
```

[camelcase]: https://en.wikipedia.org/wiki/camelCase#Variations_and_synonyms

## Type names

Type names should be capitalized using [upper camel case][camelcase].

*Right:*

```TypeScript
class UserAccount() {
  this.field = "a";
}
```

*Wrong:*

```TypeScript
class userAccount() {
  this.field = "a";
}
```

## Constants

Constants should be declared with CAPITAL letters and `const` keyword. Use underscore to name constants with complex wording.

*Right:*

```TypeScript
const SECOND = 1 * 1000;
const MY_SECOND = SECOND;
```

*Wrong:*

```TypeScript
var second = 1 * 1000;
```

## Object / Array creation

Use trailing commas and put *short* declarations on a single line. Only quote
keys when your interpreter complains:

*Right:*

```TypeScript
let a = ["hello", "world"];
let b = {
  good: "code",
  "is generally": "pretty",
};
```

*Wrong:*

```TypeScript
let a = [
  "hello", "world"
];
let b = {"good": "code"
        , is generally: "pretty"
        };
```

## Equality operator

Use the [strict comparison operators][comparisonoperators]. The triple equality operator helps to maintain data type integrity throughout the code.

*Right:*

```TypeScript
let a = 0;
if (a === "") {
    console.log("winning");
}

```

*Wrong:*

```TypeScript
let a = 0;
if (a == "") {
    console.log("losing");
}
```

[comparisonoperators]: https://developer.mozilla.org/en/JavaScript/Reference/Operators/Comparison_Operators

## Short-hand operators

Try to avoid short-hand operators except in very simple scenarios.

*Right:*

```TypeScript
let default = x || 50;
let extraLarge = "xxl";
let small = "s"
let big = (x > 10) ? extraLarge : small;
```

*Wrong:*

```TypeScript
let default = checkX(x) || getDefaultSize();
let big = (x > 10) ? checkX(x) ? getExtraLarge() : getDefaultSize() : getSmallValue();
```

## Curly braces 

Always use curly braces even in the cases of one line conditional operations.

*Right:*

```TypeScript
if (a) {
    return "winning";
}

```

*Wrong:*

```TypeScript

if (a)
    return "winning";

if (a) return "winning";
```

## Boolean comparisons

**Do not** directly compare with `true` or `false`.

*Right:*

```TypeScript

if (condition) {
    console.log("winning");
}

if (!condition) {
    console.log("winning");
}

```

*Wrong:*

```TypeScript

if (condition === true) {
    console.log("losing");
}

if (condition !== true) {
    console.log("losing");
}

if (condition !== false) {
    console.log("losing");
}

```

## Boolean conditions format
Do not use the **Yoda Conditions** when writing boolean expressions:

*Right:*

```TypeScript
let num;
if (num >= 0) {
    console.log("winning");
}
```

*Wrong:*

```TypeScript
let num;
if (0 <= num) {
    console.log("losing");
}
```

**NOTE** It is OK to use constants on the left when comparing for a range.
```TypeScript
if (0 <= num && num <= 100) {
    console.log("winning");
}
```

## Function length
Keep your functions short. A good function fits on a slide that the people in
the last row of a big room can comfortably read. So don't count on them having
perfect vision and limit yourself to 1/2 of your screen height per function (no screen rotation :).

## Return statements
There are a few important considerations here:
+ To avoid deep nesting of if-statements, always return a function's value as early
as possible. In certain routines, once you know the answer, you want to return it to the calling routine immediately. If the routine is defined in such a way that it doesn't require any cleanup, not returning immediately means that you have to write more code.
+ Minimize the number of returns in each routine. It's harder to understand a routine if, reading it at the bottom, you're unaware of the possibility that it *return*ed somewhere above.

*Right:*

```TypeScript
function getSomething(val) {
    if (val < 0) {
        return false;
    }

    if (val > 100) {
        return false;
    }

    let res1 = doOne();
    let res2 = doTwo();
    let options = {
        a: 1,
        b: 2
    };
    let result = doThree(res1, res2, options);
    return result;
}
```

*Wrong:*

```TypeScript
function getSomething(val) {
    if (val >= 0) {
        if (val < 100) {
            let res1 = doOne();
            let res2 = doTwo();
            let options = {
                             a: 1,
                             b: 2
                          };
            let result = doThree(res1, res2, options);
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
```

## Arrow Functions

Use arrow functions over anonymous function expressions. Typescript will take care of `this`.

*Right:*

```TypeScript
req.on("end", () => {
    exp1();
    exp2();
    this.doSomething();
});
```

*Wrong:*

```TypeScript
let that = this;
req.on("end", function () {
    exp1();
    exp2();
    that.doSomething();
});
```

## Comments

Use the [JSDoc][JSDOC] convention for comments. When writing a comment always think how understandable will be for somebody who is new to this code. Even if it may look simple to you think how a guy that just joined will understand it. Always comment in the following cases:
+ When there is some non-trivial logic.
+ Some "external" knowledge is needed which is missing in the context - workaround for a driver, module bug, special 'hack' because of a bug and so on;
+ When you are creating a new class
+ Public methods - include all the arguments and if possible the types {String}, {Number}. Optional arguments should be marked too. Check the [@param tag][param]

[JSDOC]: https://devdocs.io/jsdoc/
[param]: https://devdocs.io/jsdoc/tags-param

## File/module structure

A typical module should have the following structure:

1. required dependencies
2. module-private declarations - variables, functions, classes, etc.
3. export variables and functions
4. export class declarations

<!--
For more information see [this file](https://github.com/telerik/xPlatCore/blob/master/JS/BCL/CreateNewModule.md)
-->

## File naming
Use lower case for file names. Use a dash to separate different words.

*Right:*
file-system

*Wrong:*
FileSystem, fileSystem, file_system

## This, that, self
When you **need** to keep a reference to **this** use **that** as the name of the variable. Additionally, if you use the TypeScript lambda support, the compiler will take care of this automatically.

*Right:*
```TypeScript
let that = this;
doSomething(function(){
    that.doNothing();
});
```

*Wrong:*
```TypeScript
let me = this;
doSomething(function(){
    me.doNothing();
});
```

## Private (hidden) variables and methods
Although there is the **private** keyword in TypeScript, it is only a syntax sugar. There is no such notation in JavaScript and everything is available to the users. Hence, always use underscore (**_**) to prefix private variables and methods. There are also methods which have the **public** visibility but they are meant to be used within our code ONLY. Such methods should also be prefixed with an underscore.

*Right:*
```TypeScript
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
```

*Wrong:*
```TypeScript
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
```

## TypeScript optional parameters
**Do not** use optional parameters in IMPLEMENTATION files. This is because the TS compiler generates additional array and populates its from the **arguments** object. Still, it is OK to use these in a definition file (as declarations ONLY).

*Right:*
```TypeScript
// declaration
export declare function concat(...categories: string[]): string;

// implementation
export function concat(): string {
    let i;
    let result: string;
    // use the arguments object to iterate the parameters
    for (i = 0; i < arguments.length; i++) {
        // do something
    }

    return result;
}
```

*Wrong:*
```TypeScript
// declaration
export declare function concat(...categories: string[]): string;

// implementation
export function concat(...categories: string[]): string {
    let i;
    let result: string;
    // use the arguments object to iterate the parameters
    for (i = 0; i < categories.length; i++) {
        // do something
    }

    return result;
}
```

## Naming test functions
Name your test function with `test_` so that our test runner can find them and add 'underscore' tested method/property name. Different words should be capitalized (and optionally separated by 'underscore').

*Right:*
```TypeScript
export function test_goToVisualState_NoState_ShouldResetStyledProperties() {
    // Test code here.
}
```
