// @swift
// Untyped JavaScript's semantics, compiled as an npm package's code is: `this`, prototypes,
// closures, `arguments`, truthiness, `typeof`, classes, accessors, control flow, generators
// and async functions, and the builtins script reaches through prototypes.
import run from './js/semantics.cjs';

const results: string[] = run();
for (const line of results) console.log(line);
