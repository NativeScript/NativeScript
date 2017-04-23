import * as image from "../image-source";
import * as httpRequest from "./http-request";
import * as fsModule from "../file-system";

global.moduleMerge(httpRequest, exports);

export function getString(arg: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        httpRequest.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
            .then(r => {
            try {
                var str = r.content.toString();
                resolve(str);
            } catch (e) {
                reject(e);
            }
        }, e => reject(e));
    });
}

export function getJSON<T>(arg: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        httpRequest.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
            .then(r => {
            try {
                var json = r.content.toJSON();
                resolve(json);
            } catch (e) {
                reject(e);
            }
        }, e => reject(e));
    });
}

export function getImage(arg: any): Promise<image.ImageSource> {
    return httpRequest
        .request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
        .then(responce => responce.content.toImage());
}

export function getFile(arg: any, destinationFilePath?: string): Promise<any> {
    var fs: typeof fsModule = require("file-system");

    return new Promise<any>((resolve, reject) => {
        httpRequest.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
            .then(r => {
                try {
                    if (!destinationFilePath) {
                        let slashPos = arg.lastIndexOf('/') + 1;
                        let questionMarkPos = arg.lastIndexOf('?');
                        let actualFileName;
                        if(questionMarkPos != -1){
                            actualFileName = arg.substring(slashPos, questionMarkPos);
                        } else {
                            actualFileName = arg.substring(slashPos);
                        }
                        destinationFilePath = fs.path.join(fs.knownFolders.documents().path, actualFileName);
                    }
                    var file = r.content.toFile(destinationFilePath);
                    resolve(file);
                } catch (e) {
                    reject(e);
                }
            }, e => reject(e));
    });
}
