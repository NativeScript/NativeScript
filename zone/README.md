# Zone.js

[![Build Status](https://travis-ci.org/angular/zone.js.png)](https://travis-ci.org/angular/zone.js)

Implements _Zones_ for JavaScript, inspired by [Dart](https://www.dartlang.org/articles/zones/).


## What's a Zone?

A Zone is an execution context that persists across async tasks.
You can think of it as [thread-local storage](http://en.wikipedia.org/wiki/Thread-local_storage) for JavaScript VMs.

See this video from ng-conf 2014 for a detailed explanation:

[![screenshot of the zone.js presentation and ng-conf 2014](/presentation.png)](//www.youtube.com/watch?v=3IqtmUscE_U)

### Running Within a Zone

You can run code within a zone with `zone.run`.
Tasks scheduled (with `setTimeout`, `setInterval`, or event listeners) stay within that zone.

```javascript
zone.run(function () {
  zone.inTheZone = true;

  setTimeout(function () {
    console.log('in the zone: ' + !!zone.inTheZone);
  }, 0);
});

console.log('in the zone: ' + !!zone.inTheZone);
```

The above will log:

```
'in the zone: false'
'in the zone: true'
```

Note that the function delayed by `setTimeout` stays inside the zone.

### Forking a Zone

Zones have a set of hooks that allow you to change the behavior of code running within that zone.
To change a zone, you _fork_ it to get a new one.

```javascript
zone.fork({
  beforeTask: function () {
    console.log('hi');
  }
}).run(function () {
  // do stuff
});
```

Hooks that you don't override when forking a zone are inherited from the existing one.

See the [API docs](#api) below for more.


## Usage

To start using Zones, you need to include the `zone.js` script in this package onto
your page. This script should appear in the `<head>` of your HTML file before any other
scripts, including shims/polyfills.


## Examples

There are two kinds of examples:

  1. The kind you have to run
  2. Illustrative code snippets in this README

### Running the ones that you have to run

For fully working examples:

  1. Spawn a webserver in the root of the directory in which this repo lives.
  (I like to use `python -m SimpleHTTPServer 3000`).
  2. Open `http://localhost:3000/example` in your browser

Below are the aforementioned snippets.

### Tracking VM Turns

Run some function at the end of each VM turn:

```javascript
zone.fork({
  afterTask: function () {
    // do some cleanup
  }
}).run(function () {
  // do stuff
});
```

### Overriding A Zone's Hook

```javascript
var someZone = zone.fork({
  afterTask: function () {
    console.log('goodbye');
  }
});

someZone.fork({
  afterTask: function () {
    console.log('cya l8r');
  }
}).run(function () {
  // do stuff
});

// logs: cya l8r
```

### Augmenting A Zone's Hook

When you fork a zone, you'll often want to control how the parent zone's
hook gets called.

Prefixing a hook with `$` means that the hook will be passed the
parent zone's hook, and the hook will be expected to return the function to
be invoked rather than be the function itself.

```javascript
var someZone = zone.fork({
  afterTask: function () {
    console.log('goodbye');
  }
});

someZone.fork({
  $afterTask: function (parentOnLeave) {
    // return the hook
    return function afterTask() {
      parentOnLeave();
      console.log('cya l8r');
    };
  }
}).run(function () {
  // do stuff
});

// logs: goodbye
//       cya l8r
```

#### `+` and `-` Sugar
Most of the time, you'll want to run a hook before or after the parent's implementation.
You can prefix a hook with `-` for running before, and `+` for running after.

The above can be written like this:

```javascript
var someZone = zone.fork({
  afterTask: function () {
    console.log('goodbye');
  }
});

someZone.fork({
  '+afterTask': function (parentOnLeave) {
    console.log('cya l8r');
  }
}).run(function () {
  // do stuff
});

// logs: goodbye
//       cya l8r
```

This frees you from writing boilerplate to compose a new hook.

## API

Zone.js exports a single object: `window.zone`.

### `zone.run`

Runs a given function within the zone.
Explained above.

### `zone.bind`

Transforms a function to run within the given zone.

### `zone.fork`

```javascript
zone.fork({
  beforeTask: function () {},
  afterTask: function () {},
  onError: function () {},
  setTimeout: function () {},
  setInterval: function () {},
  alert: function () {},
  prompt: function () {},
  addEventListener: function () {}
});
myZone.run(function () {
  // woo!
});
```

Below describes the behavior of each of these hooks.

### `zone.onZoneCreated`

Runs when a zone is forked.

### `zone.beforeTask`

Before a function invoked with `zone.run`, this hook runs.
If `zone.beforeTask` throws, the function  passed to `run` will not be invoked.

### `zone.afterTask`

After a function in a zone runs, the `afterTask` hook runs.
This hook will run even if the function passed to `run` throws.

### `zone.onError`

This hook is called when the function passed to `run` or the `beforeTask` hook throws.

### `zone.enqueueTask`

This hook is called when a function is registered with the VM.
For instance `setTimeout` and `addEventListener`.

### `zone.dequeueTask`

This hook is called when a function is unregistered with the VM.
For instance `clearTimeout` and `removeEventListener`.

### `zone.setTimeout`, `zone.setInterval`, `zone.alert`, `zone.prompt`

These hooks allow you to change the behavior of `window.setTimeout`, `window.setInterval`, etc.
While in this zone, calls to `window.setTimeout` will redirect to `zone.setTimeout`.

### `zone.addEventListener`

This hook allows you to intercept calls to `EventTarget.addEventListener`.


## Status

* `setTimeout`, `setInterval`, and `addEventListener` work in FF23, IE10, and Chrome.
* stack trace rewrite is kinda ugly and may contain extraneous calls.
* `elt.onevent` works in FF23, IE10, but not Chrome. There's [a fix in the works though](https://code.google.com/p/chromium/issues/detail?id=43394)!


## See also
* [async-listener](https://github.com/othiym23/async-listener) - a similar library for node
* [Async stack traces in Chrome](http://www.html5rocks.com/en/tutorials/developertools/async-call-stack/)
* [strongloop/zone](https://github.com/strongloop/zone)


## License
Apache 2.0
