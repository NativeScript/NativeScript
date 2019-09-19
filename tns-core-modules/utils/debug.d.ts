/**
 * @module "utils/debug"
 */ /** */

/**
 * A runtime option indicating whether the build has debugging enabled.
 */
export let debug: boolean;

/**
 * A class encapsulating information for source code origin.
 */
export class Source {

    /**
     * Creates a new Source instance by given uri, line and column.
     */
    constructor(uri: string, line: number, column: number);

    /**
     * Gets the URI of the source document;
     */
    uri: string;

    /**
     * Gets the line in the source document.
     */
    line: number;

    /**
     * Gets the position in the source document.
     */
    column: number;

    /**
     * Get the source of an object.
     */
    public static get(object: any): Source;

    /**
     * Set the source of an object.
     */
    public static set(object: any, src: Source);
}

/**
 * An Error class that provides additional context to an error.
 */
export class ScopeError extends Error {
    /**
     * Creates a new ScopeError providing addtional context to the child error.
     * @param child The child error to extend.
     * @param message Additional message to prepend to the child error.
     */
    constructor(child: Error, message?: string);
}

/**
 * Represents a scope error providing addiot
 */
export class SourceError extends ScopeError {
    /**
     * Creates a new SourceError by child error, source and optional message.
     * @param child The child error to extend.
     * @param source The source where the error occured.
     * @param message Additonal message to prepend along the source location and the child error's message.
     */
    constructor(child: Error, source: Source, message?: string);
}
