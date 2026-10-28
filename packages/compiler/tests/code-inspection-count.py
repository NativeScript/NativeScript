#!/usr/bin/env python3
"""Counts decisions the translators read from code they already emitted (review/S3-PLAN.md §4).

A deciding site tests emitted code to choose a conversion: a regular expression run on it, a string test
(`startsWith`, `endsWith`, `includes`, `indexOf`, `match`, a `try ` strip), or a helper that does one of those.
Formatting checks (parentheses, line markers, unused names, `#available` blocks) are listed in ALLOWED and counted
apart: they shape the text, not the conversion.

  python3 tests/code-inspection-count.py [--sites] [src-dir]
"""
import collections
import os
import re
import sys

# Variables and calls holding emitted code, as the translators name them.
CODE = (r'(?:code|made|made2|inner|read|text|receiver|holder|value|raw|chain|call|body|ms|out|arg|lhs|written|line|lines'
        r'|init|steps|vals|binds|implicit|emitted|converted|left|right|cast\[1\]|up\[1\])')
EMITTING = r'this\.(?:expr|coerce|coerceTyped|tryPrefix|fromAny|fromAnyCode|convert)\([^)]*\)|code\(\)'
PATTERNS = [
    ('regex', re.compile(r'\.(?:test|exec)\((?:' + EMITTING + r'|' + CODE + r')\)')),
    ('string', re.compile(r'(?<![\w.])' + CODE + r'\.(?:startsWith|endsWith|includes|indexOf|match|slice\(4\)|replace\(/\^try)')),
    ('helper', re.compile(r'\b(?:THROWING_CODE|throwsOutside|outsideClosures|singleTry|tryAssigned|alreadyAs|balanced'
                          r'|wrapsWhole|postfixable|oneExpression|mentions|openSwiftChain|withoutRedundantImplicit'
                          r'|withoutAvailableBlocks|namesHeldOptional)\b(?:\.test)?\(')),
]
# Formatting, not conversion: the text's shape (balanced parentheses, a whole wrapped expression), its lines, names it uses.
ALLOWED = [
    re.compile(r'\b(?:balanced|wrapsWhole|postfixable|oneExpression|mentions|withoutRedundantImplicit|withoutAvailableBlocks)\('),
    re.compile(r'@Suppress|#available|#sourceLocation|sourceLocation|\\n|startsWith\([\'"]//'),
    # Names a statement's code no longer mentions, so their bindings are dropped.
    re.compile(r'new RegExp\(`\\\\b\$\{'),
    re.compile(r'const uses = \(name: string\) => new RegExp'),
    # Kotlin spelling: a line marker; a callable reference (`::f`) parenthesized before `.let` or called as `f()`; a
    # generated `when` arm split at its arrow.
    re.compile(r"startsWith\('/\*@ns:'\)|includes\('::'\)|startsWith\('::'\)|indexOf\(' -> '\)"),
    # Keys already written, not code.
    re.compile(r'written\.includes\(k\)'),
]
ALLOWED_METHODS = {'balanced', 'wrapsWhole', 'branch', 'postfixable', 'oneExpression', 'mentions', 'indented', 'withoutRedundantImplicit',
                   'withoutAvailableBlocks', 'outsideClosures',
                   # Whole Swift files parsed for their declarations (kit sources, a hoisted extension), not a value's code.
                   'namesHeldOptional', 'staticsHeldOptional', 'kitFunctionThrows', 'injectableExtension', 'namespaceDecl'}
FILES = {'swift': ['swift.ts'], 'kotlin': ['kotlin.ts'], 'shared': ['lang.ts', 'value-states.ts', 'forms.ts', 'conversion.ts']}
DEFINITION = re.compile(r'^  (?!(?:if|for|while|switch|catch|return|else|do|try)\b)(?:private |public |protected |readonly )*(?:static )?(?:async )?([A-Za-z_]\w*)\s*(?:<[^>]*>)?\(')
TOP = re.compile(r'^(?:export )?(?:function|const) ([A-Za-z_]\w*)')


def sites(path):
    method = '(top)'
    for no, line in enumerate(open(path), 1):
        m = DEFINITION.match(line)
        if m and line.rstrip().endswith('{'):
            method = m.group(1)
        t = TOP.match(line)
        if t:
            method = t.group(1)
        if line.strip().startswith(('//', '*', '/*')):
            continue
        if m or t or re.match(r'^\s*(?:export )?function ', line):
            continue
        kinds = [k for k, p in PATTERNS if p.search(line)]
        if kinds:
            allowed = method in ALLOWED_METHODS or any(a.search(line) for a in ALLOWED)
            yield no, method, kinds[0], allowed, line.strip()


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    show = '--sites' in sys.argv
    src = args[0] if args else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src')
    for backend, files in FILES.items():
        deciding, allowed, kinds, methods = 0, 0, collections.Counter(), collections.Counter()
        listed = []
        for f in files:
            path = os.path.join(src, f)
            if not os.path.exists(path):
                continue
            for no, method, kind, ok, text in sites(path):
                if ok:
                    allowed += 1
                    continue
                deciding += 1
                kinds[kind] += 1
                methods[method] += 1
                listed.append(f'{f}:{no}\t{method}\t{kind}\t{text[:150]}')
        print(f'{backend}: {deciding} deciding ({", ".join(f"{k} {v}" for k, v in kinds.most_common())}), {allowed} formatting (allowed)')
        print('  ' + ', '.join(f'{m} {n}' for m, n in methods.most_common(14)))
        if show:
            for s in listed:
                print('    ' + s)


main()
