/* tslint:disable:no-unused-variable */
// Android specific TypeScript declarations
declare function float(num: number): any;
declare function long(num: number): any;

declare var gc: () => void;

declare function float(num: number): any;
declare function long(num: number): any;

interface ArrayConstructor {
    create(type: any, count: number): any;
}