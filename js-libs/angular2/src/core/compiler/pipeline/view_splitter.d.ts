import { Parser } from 'angular2/change_detection';
import { CompileStep } from './compile_step';
import { CompileElement } from './compile_element';
import { CompileControl } from './compile_control';
/**
 * Splits views at `<template>` elements or elements with `template` attribute:
 * For `<template>` elements:
 * - moves the content into a new and disconnected `<template>` element
 *   that is marked as view root.
 *
 * For elements with a `template` attribute:
 * - replaces the element with an empty `<template>` element,
 *   parses the content of the `template` attribute and adds the information to that
 *   `<template>` element. Marks the elements as view root.
 *
 * Note: In both cases the root of the nested view is disconnected from its parent element.
 * This is needed for browsers that don't support the `<template>` element
 * as we want to do locate elements with bindings using `getElementsByClassName` later on,
 * which should not descend into the nested view.
 *
 * Fills:
 * - CompileElement#isViewRoot
 * - CompileElement#variableBindings
 * - CompileElement#propertyBindings
 */
export declare class ViewSplitter extends CompileStep {
    _parser: Parser;
    _compilationUnit: any;
    constructor(parser: Parser, compilationUnit: any);
    process(parent: CompileElement, current: CompileElement, control: CompileControl): void;
    _moveChildNodes(source: any, target: any): void;
    _addParentElement(currentElement: any, newParentElement: any): void;
    _parseTemplateBindings(templateBindings: string, compileElement: CompileElement): void;
}
