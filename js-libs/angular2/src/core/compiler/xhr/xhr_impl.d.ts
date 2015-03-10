import { XHR } from './xhr';
export declare class XHRImpl extends XHR {
    get(url: string): Promise<string>;
}
