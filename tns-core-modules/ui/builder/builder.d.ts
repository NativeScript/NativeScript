/**
 * @module "ui/builder"
 */ /** */

import { View, Template, KeyedTemplate } from "../core/view";
import { Page } from "../page";
import { NavigationEntry } from "../frame";

export interface LoadOptions {
    path: string;
    name: string;
    attributes?: any;
    exports?: any;
    page?: Page;
}

export function createViewFromEntry(entry: NavigationEntry): View;
export function parse(value: string | Template, exports?: any): View;
export function parseMultipleTemplates(value: string, exports?: any): Array<KeyedTemplate>;

export function load(fileName: string, exports?: any): View;
export function load(options: LoadOptions): View;
