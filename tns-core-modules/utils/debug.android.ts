import { Source } from "./debug-common";
export * from "./debug-common";

export class ScopeError extends Error {
    constructor(inner: Error, message?: string) {
        let formattedMessage;
        if (message && inner.message) {
            formattedMessage = message + "\n > " + inner.message.replace("\n", "\n  ");
        } else {
            formattedMessage = message || inner.message || undefined;
        }
        super(formattedMessage);
        this.stack = "Error: " + this.message + "\n" + inner.stack.substr(inner.stack.indexOf("\n") + 1);
        this.message = formattedMessage;
    }
}

export class SourceError extends ScopeError {
    constructor(child: Error, source: Source, message?: string) {
        super(child, message ? message + " @" + source + "" : source + "");
    }
}
