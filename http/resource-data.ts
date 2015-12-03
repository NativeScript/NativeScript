var documentTypeByMimeType = [];
documentTypeByMimeType["text/xml"] = "Document";
documentTypeByMimeType["text/plain"] = "Document";
documentTypeByMimeType["text/html"] = "Document";
documentTypeByMimeType["application/xml"] = "Document";
documentTypeByMimeType["application/xhtml+xml"] = "Document";
documentTypeByMimeType["text/css"] = "Stylesheet";
documentTypeByMimeType["text/javascript"] = "Script";
documentTypeByMimeType["text/ecmascript"] = "Script";
documentTypeByMimeType["application/javascript"] = "Script";
documentTypeByMimeType["application/ecmascript"] = "Script";
documentTypeByMimeType["application/x-javascript"] = "Script";
documentTypeByMimeType["application/json"] = "Script";
documentTypeByMimeType["application/x-json"] = "Script";
documentTypeByMimeType["text/x-javascript"] = "Script";
documentTypeByMimeType["text/x-json"] = "Script";
documentTypeByMimeType["text/typescript"] = "Script";

export class ResourceData {

    private _requestID: string;
    private _resourceType: string;
    private _data: any;
    private _mimeType: string;

    constructor(requestID: string) {
        this._requestID = requestID;
    }

    get mimeType(): string {
        return this._mimeType;
    }

    set mimeType(value: string) {
        if (this._mimeType !== value) {
            this._mimeType = value;

            var resourceType = "Other";

            if (this._mimeType in documentTypeByMimeType) {
                resourceType = documentTypeByMimeType[this._mimeType];
            }

            if(this._mimeType.indexOf("image/") !== -1) {
                resourceType = "Image";
            }

            if (this._mimeType.indexOf("font/") !== -1) {
                resourceType = "Font";
            }

            this._resourceType = resourceType;
        }
    }

    get requestID(): string {
        return this._requestID;
    }

    get hasTextContent(): boolean {
        return [ "Document", "Stylesheet", "Script", "XHR" ].indexOf(this._resourceType) !== -1;
    }

    get data(): any {
        return this._data;
    }

    set data(value: any) {
        if (this._data !== value) {
            this._data = value;
        }
    }

    get resourceType() {
        return this._resourceType;
    }

    set resourceType(value: string) {
        if (this._resourceType !== value) {
                this._resourceType = value;
        }
    }
}
