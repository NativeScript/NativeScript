const MODAL = "modal";
const ROOT = "root";

export const CLASS_PREFIX = "ns-";

const modalRootViewCssClasses = [`${CLASS_PREFIX}${MODAL}`];
const rootViewCssClasses = [`${CLASS_PREFIX}${ROOT}`];

function removeFromCssClasses(cssClasses: string[], value: string) {
    const index = cssClasses.indexOf(value);
    let removedElement;
    if (index > -1) {
        removedElement = cssClasses.splice(index, 1);
    }
    return removedElement;
}

export function getModalRootViewCssClasses(): string[] {
    return modalRootViewCssClasses;
}

export function getRootViewCssClasses(): string[] {
    return rootViewCssClasses;
}

export function pushToModalRootViewCssClasses(value: string): number {
    modalRootViewCssClasses.push(value);

    return rootViewCssClasses.length;
}

export function pushToRootViewCssClasses(value: string): number {
    rootViewCssClasses.push(value);

    return rootViewCssClasses.length;
}

export function removeFromModalRootViewCssClasses(value: string): string {
    return removeFromCssClasses(modalRootViewCssClasses, value);
}

export function removeFromRootViewCssClasses(value: string): string {
    return removeFromCssClasses(rootViewCssClasses, value);
}
