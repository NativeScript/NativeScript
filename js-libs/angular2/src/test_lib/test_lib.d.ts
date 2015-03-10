export { proxy } from 'rtts_assert/rtts_assert';
export declare var describe: (description: string, specDefinitions: () => void) => jasmine.Suite;
export declare var xdescribe: (desc: string, specDefinitions: () => void) => jasmine.XSuite;
export declare var ddescribe: (description: string, specDefinitions: () => void) => jasmine.Suite;
export declare var it: (description: string, func: (done?: () => void) => void) => jasmine.Spec;
export declare var xit: (desc: string, func: () => void) => jasmine.XSpec;
export declare var iit: (description: string, func: () => void) => jasmine.Spec;
export declare var beforeEach: (beforeEachFunction: () => void) => void;
export declare var afterEach: (afterEachFunction: () => void) => void;
export declare var expect: {
    (spy: Function): jasmine.Matchers;
    (actual: any): jasmine.Matchers;
};
export declare var IS_DARTIUM: boolean;
export declare class SpyObject {
    spy(name: any): any;
    rttsAssert(value: any): boolean;
    _createGuinnessCompatibleSpy(): any;
}
