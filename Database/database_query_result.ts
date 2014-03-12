export module tk {
    export module data {
        export class QueryResult {
            constructor() {

            }

            /**
              * Total number of query result items.
              */
            get count(): number {
                return 0;
            }

            /**
              * The query result items.
              */
            public items: Array<any>;
        }
    }
}  