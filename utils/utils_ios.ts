export class Collections {
    public static jsArrayToNSArray(str: string[]): any {
        var arr = new Foundation.NSMutableArray();
        if ("undefined" != typeof str) {
            for (var element in str) {
                arr.addObject(str[element]);
            }
        }
        return arr;
    }

    public static nsArrayToJSArray(a: any): string[] {
        var arr = [];
        if ("undefined" != typeof a) {
            for (var i = 0; i < a.count(); i++) {
                arr.push(a.objectAtIndex(i));
            }
        }

        return arr;
    }
}