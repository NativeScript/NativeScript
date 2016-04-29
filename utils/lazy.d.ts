declare module "utils/lazy" {
    /**
     * A function that evaluates the action only once.
     * @param action The action to be evaluated to get the result.
     * Returns the evaluated result.
     */
    export default function lazy<T>(action: () => T): () => T;
}