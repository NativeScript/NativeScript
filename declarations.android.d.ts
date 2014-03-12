
// Android specific TypeScript declarations
// TODO: This is temporary, until we have the TS definitions for the native APIs

declare module org {
    export module json {
        export class JSONArray {
            constructor(json: string);
            length: number;
        }
    }
}

declare module android {
    export module app {
        export module Application {
            export class ActivityLifecycleCallbacks {
                constructor(override: any);

                onActivityCreated: (activity: any, bundle: any) => any;
                onActivityDestroyed: (activity: any) => any;
                onActivityPaused: (activity: any) => any;
                onActivityResumed: (activity: any) => any;
                onActivitySaveInstanceState: (activity: any, bundle: any) => any;
                onActivityStarted: (activity: any) => any;
                onActivityStopped: (activity: any) => any;
            }
        }
    }
    export module location {
        export class Location {
        }

        export class LocationListener {
            constructor(overrides: any);
            onLocationChanged(location: Location);
            onProviderDisabled(provider: string);
            onProviderEnabled(provider: string);
        }

        export class Criteria {
            setAccuracy(accuracy: number);
        }
    }

    export module hardware {
        export module Camera {
            export class Parameters {
            }
        }

        export class Camera {
            public static open(camera: number): Camera;

            public getParameters(): Camera.Parameters;
            public setPreviewDisplay(surfaceHolder: android.view.SurfaceHolder);

            public startPreview();
            public stopPreview();
            public release();
        }
    }

    export module view {
        export class SurfaceHolder {
        }
    }

    export module content {
        export class Intent {
            static FLAG_ACTIVITY_NEW_TASK: any;
            static ACTION_MAIN: any;
            static createChooser(target: Intent, title: string): Intent;

            constructor();
            constructor(action: string);
            constructor(obj: any, klass: any);
            resolveActivity(pm: any): any;
            setType(type: string): Intent;
            setAction(action: string): Intent;
            setFlags(num: number);
        }
    }

    export module app {
        export class Activity {
        }
    }

    export module graphics {
        export class BitmapFactory {
            static decodeStream(s: any): any;
            static decodeFile(pathName: string, options: any): any;
            static decodeResource(res: any, identifier: number): any;
        }

        export module Bitmap {
            export enum CompressFormat {
                JPEG,
                PNG,
                WEBP,
            }
        }
    }

    export module os {
        export class Environment {
            static getExternalStorageDirectory(): java.io.File;
        }
    }
}

declare module java {
    export module io {
        export interface OutputStream {
            close();
            flush();
        }

        export interface InputStream {
        }

        export class File {
            constructor(path: string);
            exists(): boolean;
            length(): number;
            isFile(): boolean;
            isDirectory(): boolean;
            getPath(): string;
            getName(): string;
            getParentFile(): File;
            lastModified(): number;
            canWrite(): boolean;
            createNewFile(): boolean;
            delete(): boolean;
            listFiles(): Array<File>;
            getAbsolutePath(): string;
        }

        export class FileOutputStream implements OutputStream {
            constructor(file: File);
            constructor(path: string);
            close();
            flush();
        }
        export class FileInputStream implements InputStream {
            constructor(file: File);
        }
        export class OutputStreamWriter {
            constructor(stream: FileOutputStream, encoding: string);
        }

        export class InputStreamReader {
            constructor(stream: FileInputStream, encoding: string);
        }

        export class BufferedReader {
            constructor(reader: InputStreamReader);
            public readLine(): string;
            public close();
            public flush();
        }

        export class BufferedWriter {
            constructor(writer: OutputStreamWriter);
            public write(text: string);
            public close();
            public flush();
        }

        export class BufferedOutputStream implements OutputStream {
            constructor(out: OutputStream);
            close();
            flush();
        }

        export class ByteArrayOutputStream {
            public write(data: java.util.ArrayList, pos: number, count: number);
            public flush();
            public close();
            public toByteArray();
        }
    }
    export module nio {
        export class CharBuffer {
            public static allocate(capacity: number): CharBuffer;
        }
    }

    export module util {
        export class HashSet {
            add(obj: any);
        }
    }

    export module lang {
        export class Float {
            constructor(strNum: string);
            floatValue(): any;
        }
    }

}

declare module android {
    export module database {
        export module sqlite {
            export class SQLiteDatabase {
                public static openOrCreateDatabase(path: string, factory: any): SQLiteDatabase;
                public rawQuery(sqlStatement: string, arguments: Array<string>): any;
                public execSQL(sqlStatement: string);
            }
        }
    }
}

declare module org {
    export module apache {
        export module http {
            export module impl {
                export module client {

                    export class DefaultHttpClient {
                        public execute(request: org.apache.http.client.methods.HttpUriRequest, responseHandler: org.apache.http.client.ResponseHandler<any>);
                    }

                    export class BasicResponseHandler {

                    }
                }
            }
        }
    }
}

declare module org {
    export module apache {
        export module http {
            export module client {
                export class ResponseHandler<T> {

                }
            }
        }
    }
}

declare module org {
    export module apache {
        export module http {
            export module client {
                export module methods {

                    export class HttpUriRequest {
                        constructor(uri: string);
                    }

                    export class HttpGet {
                        constructor(uri: string);
                    }
                }
            }
        }
    }
}

declare module java {
    export module net {

        export class URL {
            constructor(uri: string);
            public getContent(): java.io.InputStream;
            public openConnection(): java.net.URLConnection;
        }

        export class URLConnection {
            public getInputStream(): java.io.InputStream;
        }
    }
}

declare module java {
    export module util {
        export class ArrayList {
            constructor(capacity: number);
        }
    }
}

declare module java {
    export module lang {
        export class String {
            constructor(source: string);
            getBytes(): Array<any>;
            getBytes(encoding: string): Array<any>;
        }
    }
}

declare module android {
    export module util {
        export class Base64 {
            static encodeToString(bytes: Array<any>, flags: number): string;
        }
    }
}


declare module android {
    export module widget {
        export class ImageView {
            constructor(context: any);
            setImageBitmap(bitmap: any);
        }
        export class TextView {
            constructor(context: any);
            setText(text: string);
        }
        export class ListView {
            constructor(context: any);
            setAdapter(a: any);
            getAdapter(): any;
        }
        export class BaseAdapter {
            constructor(source: any);
        }
    }
}

declare var app;
declare var telerik;