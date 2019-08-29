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
