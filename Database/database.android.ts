import query_module = require("Database/database_query_result");

export module tk {
    export module data {
        /**
          * Android specific Database implementation.
          */
        export class Database {
            public android: android.database.sqlite.SQLiteDatabase;

            public static openDatabase(path: string): Database {
                return new Database(path);
            }

            /**
                * Open or creates SQLiteDatabase using the specified path.
                */
            constructor(path: string) {
                this.android = android.database.sqlite.SQLiteDatabase.openOrCreateDatabase(path, null);
            }

            /**
              * Executes non-select SQL statements using execSQL method of android.database.sqlite.SQLiteDatabase.
              */
            public executeSql(sqlStatement: string, successCallback?: Function, errorCallback?: (e: Error) => void) {
                try {
                    if (sqlStatement.toLowerCase().indexOf("select") > -1) {
                        throw new Error("Please use 'query' method for select SQL statements!");
                    }

                    this.android.execSQL(sqlStatement);

                    if (successCallback) {
                        successCallback();
                    }
                } catch (ex) {

                    if (errorCallback) {
                        errorCallback(ex);
                    }

                }
            }

            /**
              * Executes select SQL statements using rawQuery method of android.database.sqlite.SQLiteDatabase and returns QueryResult.
              */
            public query(sqlSelectStatement: string, successCallback: (results: query_module.tk.data.QueryResult) => void, errorCallback?: (e: Error) => void) {
                try {

                    if (sqlSelectStatement.toLowerCase().indexOf("select") == -1) {
                        throw new Error("Please use 'executeSql' method for non-select SQL statements!");
                    }

                    if (successCallback) {
                        var cursor = this.android.rawQuery(sqlSelectStatement, null);

                        var qr = new query_module.tk.data.QueryResult();
                        qr.items = [];
                        qr.count = cursor.getCount();

                        if (qr.count > 0) {
                            cursor.moveToFirst();

                            var names = cursor.getColumnNames();

                            do {
                                var item = {};

                                for (var name in names) {
                                    item[name] = cursor.getString(cursor.getColumnIndex(name));
                                }

                                qr.items.push(item);
                            } while (cursor.moveToNext());

                            cursor.close();
                        }

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