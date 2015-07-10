// https://fetch.spec.whatwg.org/#json
type object = JSON;

type body = Object; // byte stream

// https://fetch.spec.whatwg.org/#bodyinit
type BodyInit = Blob | BufferSource | FormData | URLSearchParams | USVString

// https://fetch.spec.whatwg.org/#body
interface IBody {
  // readonly property
  bodyUsed:      boolean;

  // method
  arrayBuffer(): Promise<ArrayBuffer>;
  blob():        Promise<Blob>;
  formData():    Promise<FormData>;
  json():        Promise<JSON>;
  text():        Promise<USVString>;
};

// https://fetch.spec.whatwg.org/#body
class Body implements IBody {
  private _bodyUsed: boolean;
  private _body:     body;
  private _usedFlag: boolean;
  private _mimeType: string;

  get bodyUsed(): boolean {
    return this._bodyUsed;
  }

  get body(): body {
    return this._body;
  }

  get usedFlag(): boolean {
    return this._usedFlag;
  }

  get mimeType(): string {
    return this._mimeType;
  }

  consumeBody(_type: string): any {
    // step 1
    var p = new Promise((resolve, reject) => {
      // step 2
      if (this._bodyUsed == true) {
        return reject(new TypeError("body was already used"));
      }

      // step 3
      this._bodyUsed = true;

      // step 3-1
      var stream = this._body;

      // step 3-2
      if (stream == null) {
        stream = [];
      }

      // step 3-3
      // TODO: Let bytes be the result of reading from stream until it returns end-of-stream.
      var bytes;

      // step 4
      // TODO: implement me
      switch(_type) {
        case "ArrayBuffer":
        case "Blob":
        case "FormData":
        case "JSON":
        case "text":
      }
    });
    return p;
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return this.consumeBody("ArrayBuffer");
  }

  blob(): Promise<Blob> {
    return this.consumeBody("Blob");
  }

  formData(): Promise<FormData> {
    return this.consumeBody("FormData");
  }

  json(): Promise<JSON> {
    return this.consumeBody("JSON");
  }

  text(): Promise<USVString> {
    return this.consumeBody("text");
  }
}
