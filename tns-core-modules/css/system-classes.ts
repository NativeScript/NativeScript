const MODAL = "modal";
const ROOT = "root";

export const CLASS_PREFIX = "ns-";

const modalRootViewCssClass = `${CLASS_PREFIX}${MODAL}`;
const rootViewCssClasses = [`${CLASS_PREFIX}${ROOT}`];

export function getModalRootViewCssClass(): string {
    return modalRootViewCssClass;
}

export function getRootViewCssClasses(): string[] {
    return rootViewCssClasses;
}

export function pushToRootViewCssClasses(value: string): number {
    rootViewCssClasses.push(value);

    return rootViewCssClasses.length;
}

export function removeFromRootViewCssClasses(value: string): string {
    const index = rootViewCssClasses.indexOf(value);
    let removedElement;

    if (index > -1) {
        removedElement = rootViewCssClasses.splice(index, 1);
    }

    return removedElement;
}

export function resetRootViewCssClasses(): string[] {
    // Preserve the default `ns-root` CSS class
    return rootViewCssClasses.splice(1);
}
