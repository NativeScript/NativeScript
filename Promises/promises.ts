export function when(...promises: Promise[]): Promise {
    var all_done = new Deferred();
    var results = [];
    var remaining = promises.length;

    promises.map(
        (p, i) => {
            p.then(
                function (...args: any[]) {
                    results[i] = args;
                    remaining--;
                    if (!remaining && all_done.status() !== 'rejected') {
                        all_done.resolve.apply(all_done, results);
                    }
                },
                function () { all_done.reject() }
                );
        }
        );

    if (!remaining) {
        all_done.resolve.apply(all_done, results);
    }

    return all_done.promise();
}

export class Promise {

    constructor(private deferred: Deferred) { }

    then(callback: Function, error?: Function): Promise {
        return this.deferred.then(callback, error);
    }

    status(): string { return this.deferred.status() }
    result(): any[] { return this.deferred.result() }
}

export class Deferred {

    private resolved: Function[] = [];
    private rejected: Function[] = [];
    private _status: string;
    private _result: any[];
    private _promise: Promise;

    constructor() {
        this._promise = new Promise(this);
        this._status = 'in progress';
    }

    promise(): Promise { return this._promise }
    status(): string { return this._status }
    result(): any[] { return this._result }

    resolve(...result: any[]): Deferred {
        this._result = result;
        this.notify(this.resolved, result);
        this.resolved = [];
        this._status = 'resolved';
        return this;
    }

    reject(...result: any[]): Deferred {
        this._result = result;
        this.notify(this.rejected, result);
        this.rejected = [];
        this._status = 'rejected';
        return this;
    }

    then(callback: Function, error: Function): Promise {
        var d = new Deferred();

        this.resolved.push(this.wrap(d, callback, 'resolve'));

        if (error) {
            this.rejected.push(this.wrap(d, error, 'reject'));
        }

        if (this._status === 'resolved') {
            this.resolve.apply(this, this.result);
        }
        else if (this._status === 'rejected' && error) {
            this.reject.apply(this, this.result);
        }

        return d.promise();
    }

    private wrap(d: Deferred, f: Function, method: string): Function {
            return function (...args: any[]) {
            var result = f.apply(f, args);
            if (result && result instanceof Promise) {
                result.then(
                    function () { d.resolve() },
                    function () { d.reject() }
                    );
            }
            else {
                d[method].apply(d, typeof result === 'array' ? result : [result]);
            }
        }
        }

    private notify(funcs: Function[], result: any[]): void {
        funcs.map((f) => { f.apply(f, result) });
    }
}