import * as ts from 'typescript';
export default function (ctx: ts.TransformationContext): (source: ts.SourceFile) => ts.SourceFile;
