import definition = require("ui/image-cache");
import observable = require("data/observable");
import imageSource = require("image-source");

export module knownEvents {
    export var downloaded = "downloaded";
}

export interface DownloadRequest {
    url: string;
    key: string;
    completed?: (result: imageSource.ImageSource, key: string) => void;
}

export class Cache extends observable.Observable implements definition.Cache {
    public placeholder: imageSource.ImageSource;
    public maxRequests = 5;
    private _enabled = true;

    private _cache = {};
    private _pendingDownloads = {};
    private _queue: Array<DownloadRequest> = [];
    private _currentDownloads = 0;

    public enableDownload() {
        if (this._enabled) {
            return;
        }

        // schedule all pending downloads
        this._enabled = true;
        var request: DownloadRequest;

        while (this._queue.length > 0 && this._currentDownloads < this.maxRequests) {
            request = this._queue.pop();
            if (!(request.key in this._pendingDownloads)) {
                this._download(request);
            }
        }
    }

    public disableDownload() {
        if (!this._enabled) {
            return;
        }

        this._enabled = false;
    }

    public push(request: DownloadRequest): void {
        this._addRequest(request, true);
    }

    public enqueue(request: DownloadRequest): void {
        this._addRequest(request, false);
    }

    private _addRequest(request: DownloadRequest, onTop: boolean): void {
        if (request.key in this._pendingDownloads) {
            var existingRequest = <DownloadRequest>this._pendingDownloads[request.key];
            this._mergeRequests(existingRequest, request);
        }
        else {
            // TODO: Potential performance bottleneck - traversing the whole queue on each download request.
            var queueRequest: DownloadRequest;
            for (var i = 0; i < this._queue.length; i++) {
                if (this._queue[i].key === request.key) {
                    queueRequest = this._queue[i];
                    break;
                }
            }

            if (queueRequest) {
                this._mergeRequests(queueRequest, request);
            }
            else {
                if (this._shouldDownload(request, onTop)) {
                    this._download(request);
                }
            }
        }
    }

    private _mergeRequests(existingRequest: DownloadRequest, newRequest: DownloadRequest) {
        if (existingRequest.completed) {
            if (newRequest.completed) {
                var existingCompleted = existingRequest.completed;
                var stackCompleted = function (result: imageSource.ImageSource, key: string) {
                    existingCompleted(result, key);
                    newRequest.completed(result, key);
                }

                existingRequest.completed = stackCompleted;
            }
        }
        else {
            existingRequest.completed = newRequest.completed;
        }
    }

    public get(key: string): imageSource.ImageSource {
        var value = this._cache[key];
        if (value) {
            return value;
        }

        return undefined;
    }

    public set(key: string, source: imageSource.ImageSource): void {
        this._cache[key] = source;
    }

    public remove(key: string): void {
        delete this._cache[key];
    }

    public clear() {
        var keys = Object.keys(this._cache);
        var i;
        var length = keys.length;

        for (i = 0; i < length; i++) {
            delete this._cache[keys[i]];
        }
    }

    /* tslint:disable:no-unused-variable */
    public _downloadCore(request: definition.DownloadRequest) {
        // This method is intended to be overridden by the android and ios implementations
    }
    /* tslint:enable:no-unused-variable */

    public _onDownloadCompleted(key: string, result: imageSource.ImageSource) {
        var request = <DownloadRequest>this._pendingDownloads[key];

        this._cache[request.key] = result;
        this._currentDownloads--;

        if (request.completed) {
            request.completed(result, request.key);
        }

        if (this.hasListeners(knownEvents.downloaded)) {
            this.notify({
                eventName: knownEvents.downloaded,
                object: this,
                key: key,
                image: result
            });
        }

        delete this._pendingDownloads[request.key];

        this._updateQueue();
    }

    private _shouldDownload(request: definition.DownloadRequest, onTop: boolean): boolean {
        if (request.key in this._cache || request.key in this._pendingDownloads) {
            return false;
        }

        if (this._currentDownloads >= this.maxRequests || !this._enabled) {
            if (onTop) {
                this._queue.push(request);
            }
            else {
                this._queue.unshift(request);
            }

            return false;
        }

        return true;
    }

    private _download(request: definition.DownloadRequest) {
        this._currentDownloads++;
        this._pendingDownloads[request.key] = request;

        this._downloadCore(request);
    }

    private _updateQueue() {
        if (!this._enabled || this._queue.length === 0 || this._currentDownloads === this.maxRequests) {
            return;
        }

        var request = this._queue.pop();
        this._download(request);
    }
}