// Property lists as the NativeScript CLI merges them (its plist-session):
// parsed to plain values, merged patch by patch, written back as XML.
import { execFileSync } from 'node:child_process';

/** A plist value. Dictionaries are plain objects in key order; scalars other than strings and booleans keep their element. */
export type PlistValue = string | boolean | PlistValue[] | PlistDict | PlistScalar;
export interface PlistDict { [key: string]: PlistValue }
export interface PlistScalar { element: 'integer' | 'real' | 'date' | 'data'; text: string }

const isScalar = (v: PlistValue): v is PlistScalar => typeof v === 'object' && !Array.isArray(v) && typeof (v as PlistScalar).element === 'string' && typeof (v as PlistScalar).text === 'string' && Object.keys(v).length === 2;
const isDict = (v: PlistValue | undefined): v is PlistDict => typeof v === 'object' && v !== null && !Array.isArray(v) && !isScalar(v);

/** A plist file of any format (plutil normalizes binary and JSON ones to XML). */
export function readPlist(file: string): PlistDict {
  return parsePlist(execFileSync('plutil', ['-convert', 'xml1', '-o', '-', file], { encoding: 'utf8' }));
}

export function parsePlist(xml: string): PlistDict {
  const tokens = [...xml.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<(\/?)(\w+)(?:\s+[^>]*?)?(\s*\/)?>|([^<]+)/g)];
  let i = 0;
  const skipText = () => { while (i < tokens.length && tokens[i][4] !== undefined && !tokens[i][4].trim()) i++; };
  const text = (tag: string): string => {
    let out = '';
    while (i < tokens.length && !(tokens[i][1] && tokens[i][2] === tag)) out += tokens[i++][4] ?? '';
    i++;
    return decode(out);
  };
  const value = (): PlistValue => {
    skipText();
    const [, close, tag, empty] = tokens[i++];
    if (close) throw new Error(`plist: unexpected </${tag}>`);
    if (tag === 'true' || tag === 'false') { if (!empty) i++; return tag === 'true'; }
    if (tag === 'string' || tag === 'key') return empty ? '' : text(tag);
    if (tag === 'integer' || tag === 'real' || tag === 'date' || tag === 'data') return { element: tag, text: empty ? '' : text(tag).trim() };
    if (tag === 'array') {
      const out: PlistValue[] = [];
      if (empty) return out;
      for (;;) { skipText(); if (tokens[i][1] && tokens[i][2] === 'array') { i++; return out; } out.push(value()); }
    }
    if (tag === 'dict') {
      const out: PlistDict = {};
      if (empty) return out;
      for (;;) {
        skipText();
        if (tokens[i][1] && tokens[i][2] === 'dict') { i++; return out; }
        const [, , keyTag] = tokens[i++];
        if (keyTag !== 'key') throw new Error(`plist: <${keyTag}> where a <key> belongs`);
        const key = text('key');
        out[key] = value();
      }
    }
    throw new Error(`plist: <${tag}>`);
  };
  while (i < tokens.length && tokens[i][2] !== 'plist') i++;
  i++;
  const root = value();
  if (!isDict(root)) throw new Error('plist: the root is not a dictionary');
  return root;
}

const decode = (s: string) => s.replace(/&(lt|gt|amp|quot|apos|#(\d+)|#x([0-9a-fA-F]+));/g, (_, e: string, dec?: string, hex?: string) =>
  dec ? String.fromCodePoint(+dec) : hex ? String.fromCodePoint(parseInt(hex, 16)) : ({ lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" } as Record<string, string>)[e]);
const encode = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function writePlist(root: PlistDict): string {
  const out = (v: PlistValue, pad: string): string => {
    if (typeof v === 'string') return `${pad}<string>${encode(v)}</string>`;
    if (typeof v === 'boolean') return `${pad}<${v}/>`;
    if (Array.isArray(v)) return v.length ? `${pad}<array>\n${v.map((x) => out(x, pad + '\t')).join('\n')}\n${pad}</array>` : `${pad}<array/>`;
    if (isScalar(v)) return `${pad}<${v.element}>${encode(v.text)}</${v.element}>`;
    const keys = Object.keys(v);
    return keys.length ? `${pad}<dict>\n${keys.map((k) => `${pad}\t<key>${encode(k)}</key>\n${out(v[k], pad + '\t')}`).join('\n')}\n${pad}</dict>` : `${pad}<dict/>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n${out(root, '')}\n</plist>\n`;
}

/**
 * The CLI's `PlistMerger.merge`, lodash's `mergeWith` with its customizer:
 * dictionaries merge key by key, `CFBundleURLTypes` entries fold by role,
 * `LSApplicationQueriesSchemes` gains the schemes it lacks, and every other
 * array is replaced.
 */
export function mergePlist(base: PlistDict, patch: PlistDict): PlistDict {
  const out: PlistDict = structuredClone(base);
  for (const [key, value] of Object.entries(patch)) {
    const current = out[key];
    if (key === 'CFBundleURLTypes' && Array.isArray(current) && Array.isArray(value)) {
      for (const type of value as PlistDict[]) {
        const same = (current as PlistDict[]).find((t) => t.CFBundleTypeRole === type.CFBundleTypeRole);
        if (same) same.CFBundleURLSchemes = [...(same.CFBundleURLSchemes as PlistValue[] ?? []), ...(type.CFBundleURLSchemes as PlistValue[] ?? [])];
        else current.push(structuredClone(type));
      }
    } else if (key === 'LSApplicationQueriesSchemes' && Array.isArray(current) && Array.isArray(value)) {
      for (const scheme of value) if (!current.includes(scheme)) current.push(scheme);
    } else if (isDict(current) && isDict(value)) {
      out[key] = mergePlist(current, value);
    } else {
      out[key] = structuredClone(value);
    }
  }
  return out;
}
