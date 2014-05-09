export class Collections {
    public static stringArrayToStringSet(str: string[]): any {
        var hashSet = new java.util.HashSet();
        if ("undefined" != typeof str) {
            for (var element in str) {
                hashSet.add('' + str[element]);
            }
        }
        return hashSet;
    }

    public static stringSetToStringArray(stringSet: any): string[] {
        var arr = [];
        if ("undefined" != typeof stringSet) {
            var it = stringSet.iterator();
            while (it.hasNext()) {
                var element = '' + it.next();
                arr.push(element);
            }
        }

        return arr;
    }
}

export function setTimeout(callback, milliseconds) {
    new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(
        new java.lang.Runnable({
            run: function () { callback(); }
        }),
        milliseconds);
}