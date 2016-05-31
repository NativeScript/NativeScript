declare module "utils/lazy" {
    /**
     * A function that evaluates the action only once.
     * @param action The action to be evaluated to get the result.
     * Returns the evaluated result.
     */
    export default function lazy<T>(action: () => T): () => T;

    /**
     * A function that executes the extend call immediately or delays
     * it if running in the context of a snapshot.
     * @param classExtend The JavaScript class implementation wrapped in a function
     */
    export function lazyExtend<T>(classExtend: () => T): { value: T };
}