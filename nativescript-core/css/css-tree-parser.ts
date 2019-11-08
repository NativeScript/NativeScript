import {
    parse
} from "css-tree";

function mapSelectors(selector: string): string[] {
    if (!selector) {
        return [];
    }

    return selector.split(/\s*(?![^(]*\)),\s*/).map(s => s.replace(/\u200C/g, ","));
}

function mapPosition(node) {
    return {
        start: {
            line: node.loc.start.line,
            column: node.loc.start.column
        },
        end: {
            line: node.loc.end.line,
            column: node.loc.end.column
        }
    };
}

function transformAst(node) {
    if (!node) {
        return;
    }

    if (node.type === "StyleSheet") {
        return {
            type: "stylesheet",
            stylesheet: {
                source: node.loc.source,
                rules: node.children.toArray().map(child => transformAst(child)),
                parsingErrors: []
            }
        };
    }

    if (node.type === "Atrule") {
        let atrule: any = {
            type: node.name,
        };

        if (node.name === "supports" || node.name === "media") {
            atrule[node.name] = node.prelude.value;
            atrule.rules = transformAst(node.block);
        } else if (node.name === "page") {
            atrule.selectors = node.prelude ? mapSelectors(node.prelude.value) : [];
            atrule.declarations = transformAst(node.block);
        } else if (node.name === "document") {
            atrule.document = node.prelude ? node.prelude.value : "";
            atrule.vendor = "";
            atrule.rules = transformAst(node.block);
        } else if (node.name === "font-face") {
            atrule.declarations = transformAst(node.block);
        } else if (node.name === "import" || node.name === "charset" || node.name === "namespace") {
            atrule[node.name] = node.prelude ? node.prelude.value : "";
        } else {
            atrule.rules = transformAst(node.block);
        }

        return atrule;
    }

    if (node.type === "Block") {
        return node.children.toArray().map(child => transformAst(child));
    }

    if (node.type === "Rule") {
        let value = node.prelude.value;

        return {
            type: "rule",
            selectors: mapSelectors(value),
            declarations: transformAst(node.block),
            position: mapPosition(node)
        };
    }

    if (node.type === "Comment") {
        return {
            type: "comment",
            comment: node.value,
            position: mapPosition(node)
        };
    }

    if (node.type === "Declaration") {
        return {
            type: "declaration",
            property: node.property,
            value: node.value.value,
            position: mapPosition(node)
        };
    }

    throw Error(`Unknown node type ${node.type}`);
}

export function cssTreeParse(css, source): any {
    let errors = [];
    let ast = parse(css, {
        parseValue: false,
        parseAtrulePrelude: false,
        parseRulePrelude: false,
        positions: true,
        filename: source,
        onParseError: error => {
            errors.push(`${source}:${error.line}:${error.column}: ${error.formattedMessage}`);
        }
    });

    if (errors.length > 0) {
        throw new Error(errors[0]);
    }

    return transformAst(ast);
}