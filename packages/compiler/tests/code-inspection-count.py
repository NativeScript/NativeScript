#!/usr/bin/env python3
"""Counts decisions the translators read from code they already emitted (review/S3-PLAN.md §4).

A deciding site tests emitted code to choose a conversion: a regular expression run on it, a string test
(`startsWith`, `endsWith`, `includes`, `indexOf`, `match`, a `try ` strip), or a helper that does one of those.
Formatting checks (parentheses, line markers, unused names, `#available` blocks) are listed in ALLOWED and counted
apart: they shape the text, not the conversion. Swift's try-placement scans (whether emitted code holds a `try` or a
throwing helper, so that what holds it is marked `try` or `throws`) are counted on their own line until the AST throws
analysis replaces them (review/S3-PLAN.md, S3-12).

The key-state line (review/S4-S5-PLAN.md §4) counts what S4's key plan replaces: tests on a rendered type string that
decide a key's state (`f.type.endsWith('?')`, `isOptional(f.type)`, `held(f)`) in the methods that decide keys, one per
line, and the key-state methods each backend still has its own copy of.

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
    ('helper', re.compile(r'\b(?:THROWING_CODE|throwsOutside|outsideClosures|singleTry|tryAssigned|balanced'
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
    # Swift grammar: a postfix chain still open continues with `.` (`a?.b(c).d`); a closure called in place is
    # parenthesized where `if` would read it as its body.
    re.compile(r'\bopenSwiftChain\(|\bpostfixChain\(|code\.startsWith\(\'\{\'\) \? `\(\$\{code\}\)`'),
]
# Swift try placement: a test of emitted code for `try`, a throwing helper, or the statement shapes `try` goes before.
TRY_PLACEMENT = re.compile(r"\b(?:THROWING_CODE|throwsOutside|outsideClosures|singleTry|tryAssigned)\b|\\btry\\b|\^\\\(\*try\\b|\^try |startsWith\('try '\)")
ALLOWED_METHODS = {'balanced', 'wrapsWhole', 'branch', 'postfixable', 'oneExpression', 'mentions', 'indented', 'withoutRedundantImplicit',
                   'withoutAvailableBlocks', 'outsideClosures', 'postfixChain', 'openSwiftChain',
                   # Whole Swift files parsed for their declarations (kit sources, a hoisted extension), not a value's code.
                   'namesHeldOptional', 'staticsHeldOptional', 'kitFunctionThrows', 'injectableExtension', 'namespaceDecl', 'publicize'}
# The try-placement helpers themselves: every line of theirs is one.
TRY_METHODS = {'tryAssigned', 'singleTry', 'throwsOutside'}
FILES = {'swift': ['swift.ts'], 'swift native-calls': ['native-calls.ts'], 'swift kit-gen': ['kit-gen.ts'], 'kotlin': ['kotlin.ts'],
         'shared': ['lang.ts', 'value-states.ts', 'forms.ts', 'conversion.ts', 'placement.ts', 'shapes.ts']}
# A variable assigned a rendered type in the method (`const receiver = this.typeOf(x)`): tests on it read types, not code.
TYPE_VAR = re.compile(r'\b(?:const|let) (\w+) = this\.(?:typeOf|type|declaredTypeOf|returnTypeOf|computedType)\(')
DEFINITION = re.compile(r'^  (?!(?:if|for|while|switch|catch|return|else|do|try)\b)(?:private |public |protected |readonly )*(?:static )?(?:async )?([A-Za-z_]\w*)\s*(?:<[^>]*>)?\(')
TOP = re.compile(r'^(?:export )?(?:function|const) ([A-Za-z_]\w*)')


# The methods that decide an object's keys from field type strings, in either backend.
KEY_METHODS = {'shape', 'object', 'objectClassCode', 'objectClass', 'accessorClass', 'shapeProtocols', 'structuralCopy', 'dynamicMembers', 'classKeys'}
KEY_TYPE_TEST = re.compile(r"""(?:\.type|typeOf\([^)]*\)|shapeHeld\([^)]*\)|\bpt)\.endsWith\('\?'\)|isOptional\([^)]*\btype\b[^)]*\)|isNullable\([^)]*\)"""
                           r"""|/\[\?!\]\$/\.test\([^)]*\)|\.type [!=]== 'Any\?'|isFunctionType\(f\.type\)|hasTopLevelArrow\(this\.shapeHeld""")
# Key-state methods each backend writes its own copy of (S4-1 and S4-5 make them one plan).
TWIN_KEY_METHODS = {'classKeys', 'keyHierarchy', 'deletedFields', 'keyedClass', 'keyedMembers', 'levelStart', 'initKeyNotes', 'appRootKeepsExpando',
                    'definedKeys', 'definableNames', 'definedField', 'definedAccess', 'isExpando', 'givenUndeclared', 'instanceKeys'}


def key_state(path):
    """Type-string tests deciding key state (line, method, text), and the twin key methods' (name, lines)."""
    tests, extents, method, start = [], {}, None, 0
    lines = open(path).read().split('\n')
    for no, line in enumerate(lines, 1):
        m = DEFINITION.match(line)
        if m and line.rstrip().endswith('{'):
            if method in TWIN_KEY_METHODS:
                extents[method] = no - start
            method, start = m.group(1), no
        if method in KEY_METHODS and not line.strip().startswith(('//', '*', '/*')) and KEY_TYPE_TEST.search(line):
            tests.append((no, method, line.strip()))
    if method in TWIN_KEY_METHODS:
        extents[method] = len(lines) + 1 - start
    return tests, extents


def sites(path):
    method = '(top)'
    types = set()
    for no, line in enumerate(open(path), 1):
        m = DEFINITION.match(line)
        if m and line.rstrip().endswith('{'):
            method = m.group(1)
            types = set()
        t = TOP.match(line)
        if t:
            method = t.group(1)
            types = set()
        types.update(TYPE_VAR.findall(line))
        if line.strip().startswith(('//', '*', '/*')):
            continue
        if m or t or re.match(r'^\s*(?:export )?function ', line):
            continue
        tested = line
        for v in types:
            tested = re.sub(r'(?<![\w.])' + v + r'\.(?:startsWith|endsWith|includes)\(', 'typeTest(', tested)
        kinds = [k for k, p in PATTERNS if p.search(tested)]
        if kinds:
            allowed = method in ALLOWED_METHODS or any(a.search(line) for a in ALLOWED)
            yield no, method, 'try' if TRY_PLACEMENT.search(line) or method in TRY_METHODS else kinds[0], allowed, line.strip()


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    show = '--sites' in sys.argv
    src = args[0] if args else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src')
    for backend, files in FILES.items():
        deciding, allowed, placing, kinds, methods = 0, 0, 0, collections.Counter(), collections.Counter()
        listed, placed = [], []
        for f in files:
            path = os.path.join(src, f)
            if not os.path.exists(path):
                continue
            for no, method, kind, ok, text in sites(path):
                if ok:
                    allowed += 1
                    continue
                if kind == 'try':
                    placing += 1
                    placed.append(f'{f}:{no}\t{method}\t{text[:150]}')
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
        if backend.startswith('swift'):
            print(f'{backend}: try-placement scans: {placing}')
            if show:
                for s in placed:
                    print('    ' + s)
        if backend in ('swift', 'kotlin'):
            tests, twins = key_state(os.path.join(src, files[0]))
            print(f'{backend}: key-state: {len(tests)} type-string tests in {len({m for _, m, _ in tests})} methods; '
                  f'{len(twins)} twin key methods ({sum(twins.values())} lines)')
            if show:
                for no, method, text in tests:
                    print(f'    {files[0]}:{no}\t{method}\t{text[:150]}')


main()
