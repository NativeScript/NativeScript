import qr = require("Database/database_query_result");

/**
 * Data (Database) module.
 */
export declare module tk {
    export module data {
        /**
          * The Database interface.
          */
        export class Database {
            executeSql(sqlStatement: string, successCallback?: Function, errorCallback?: (e: Error) => void)
            query(sqlSelectStatement: string, successCallback: (results: qr.tk.data.QueryResult) => void, errorCallback?: (e: Error) => void)
        }
    }
} 