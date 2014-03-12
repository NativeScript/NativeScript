import query_module = require("Database/database_query_result");

export module tk {
    export module data {
        export class Database {

            public static openDatabase(path: string): Database {
                return new Database(path);
            }

            constructor(path: string) {

            }

            public executeSql(sqlStatement: string, successCallback?: Function, errorCallback?: (e: Error) => void) {
                try {

                    // native code goes here

                    if (successCallback) {
                        successCallback();
                    }
                } catch (ex) {

                    if (errorCallback) {
                        errorCallback(ex);
                    }

                }
            }

            public query(sqlSelectStatement: string, successCallback: (results: query_module.tk.data.QueryResult) => void, errorCallback?: (e: Error) => void) {
                try {

                    // native code goes here

                    if (successCallback) {

                        var qr = new query_module.tk.data.QueryResult();

                        successCallback(qr);
                    }
                } catch (ex) {

                    if (errorCallback) {
                        errorCallback(ex);
                    }

                }
            }
        }
    }
}  