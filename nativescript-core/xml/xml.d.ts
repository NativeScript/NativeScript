/**
 * Contains the XmlParser class, which is a SAX parser using the easysax implementation.
 * @module "xml"
 */ /** */

/**
 * Specifies the type of parser event.
 */
export class ParserEventType {

    /**
     * Specifies the StartElement event type.
     */
    static StartElement: string;

    /**
     * Specifies the EndElement event type.
     */
    static EndElement: string;

    /**
     * Specifies the Text event type.
     */
    static Text: string;

    /**
     * Specifies the CDATA event type.
     */
    static CDATA: string;

    /**
     * Specifies the Comment event type.
     */
    static Comment: string;
}

/**
 * Defines a position within string, in line and column form.
 */
export interface Position {
    /**
     * The line number. The first line is at index 1.
     */
    line: number;

    /**
     * The column number. The first character is at index 1.
     */
    column: number;
}

/**
 * Provides information for a parser event.
 */
export interface ParserEvent {

    /**
     * Returns the type of the parser event. This is one of the ParserEventType static members.
     */
    eventType: string;

    /**
     * Get the position in the xml string where the event was generated.
     */
    position: Position;

    /**
     * If namespace processing is enabled, returns the prefix of the element in case the eventType is ParserEventType.StartElement or ParserEventType.EndElement.
     */
    prefix?: string;

    /**
     *  If namespace processing is enabled, returns the namespace of the element in case the eventType is ParserEventType.StartElement or ParserEventType.EndElement.
     */
    namespace?: string;

    /**
     * Returns the name of the element in case the eventType is ParserEventType.StartElement or ParserEventType.EndElement.
     */
    elementName?: string;

    /**
     * Returns a JSON object with the attributes of an element in case the eventType is ParserEventType.StartElement.
     */
    attributes?: Object;

    /**
     * Returns the relevant data in case the eventType is ParserEventType.Text, ParserEventType.CDATA or ParserEventType.Comment.
     */
    data?: string;

    /**
     * Returns a JSON string representation of this instance.
     */
    toString(): string;
}

/**
 * A simple non-validating SAX parser based on https://github.com/vflash/easysax version 0.1.14
 */
export class XmlParser {

    /**
     * Creates a new instance of the XmlParser class.
     * @param onEvent The callback to execute when a parser event occurs. The 'event' parameter contains information about the event.
     * @param onError The callback to execute when a parser error occurs. The 'error' parameter contains the error.
     * @param processNamespaces Specifies whether namespaces should be processed.
     */
    constructor(onEvent: (event: ParserEvent) => void, onError?: (error: Error, position: Position) => void, processNamespaces?: boolean, angularSyntax?: boolean);

    /**
     * Parses the supplied xml string.
     * @param xmlString The string containing the xml to parse.
     */
    parse(xmlString: string): void;
}
