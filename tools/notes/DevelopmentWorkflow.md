Development Workflow
====================

```bash
# Setup local dependencies and repo for work
npm run setup

# See what commands you can run
npm start
```

To simplify workspace development and maintenance we provide an interactive menu via `npm start` which lists all the commands you can run. You can type to filter the list and hit ENTER to run. Each command invokes a [Nx](https://nx.dev) workspace command which you can even copy/paste to run directly if you don't want to use the interactive menu any longer.

## Initial Setup

Clone (or fork/clone) the repo and run setup script:

```bash
git clone https://github.com/NativeScript/NativeScript.git
cd NativeScript 
npm run setup
```

## Unit Testing

### Run unit tests with jest with either option:

A. Using convenient start menu:

```bash
npm start 
> (Type) "core.test" (...to isolate the menu to "@nativescript.core.test"), hit ENTER
```

B. Using direct Nx command:

```bash
npx nx run core:test
```

### Watch mode

To enable live watch mode you can add the `--watch` flag, for example:

```bash
npx nx run core:test --watch
```

### Isolate tests by name

Run a single test by it's decribe name, for example to run just the `xml/index.spec.ts`, the describe block is named `XmlParser` therefore:

```
npx nx run core:test --watch -t 'XmlParser' 
```

## Running the `e2e` Test Apps

There are a couple of application used for development and testing.
* `apps/automated` Automated e2e tests 
* `apps/toolbox` Used for local development experimentation and confirming cases. More simplistic, use this one most often.
* `apps/ui` Also used for local development experimentation and confirming cases. More sophisticated setup.

Run automated e2e test suite with:

```bash
npx nx run apps-automated:ios

// or...

npx nx run apps-automated:android
```

# Documentation API reference

The following will build the API reference pages in `bin/dist/apiref`:

```bash
npm run typedoc
```

If you want to improve on the documentation you can also build and start up dev web server:

```bash
npm run dev-typedoc
```

The terminal will point the address you can open in your web browser.
