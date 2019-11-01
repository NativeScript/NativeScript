const MODAL = "modal";
const ROOT = "root";

export const CLASS_PREFIX = "ns-";

export const MODAL_ROOT_VIEW_CSS_CLASS = `${CLASS_PREFIX}${MODAL}`;
export const ROOT_VIEW_CSS_CLASS = `${CLASS_PREFIX}${ROOT}`;

const cssClasses = [];

export function _getCssClasses(): string[] {
    return cssClasses;
}

export function _pushToCssClasses(value: string): number {
    cssClasses.push(value);

    return cssClasses.length;
}

export function _removeCssClass(value: string): string {
    const index = cssClasses.indexOf(value);
    let removedElement;

    if (index > -1) {
        removedElement = cssClasses.splice(index, 1);
    }

    return removedElement;
}
