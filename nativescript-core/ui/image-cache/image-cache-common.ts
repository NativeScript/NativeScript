import * as definition from '.';
import * as observable from '../../data/observable';
import * as imageSource from '../../image-source';

export interface DownloadRequest {
	url: string;
	key: string;
	completed?: (image: any, key: string) => void;
	error?: (key: string) => void;
}

export class Cache extends observable.Observable implements definition.Cache {
	public static downloadedEvent = 'downloaded';
	public static downloadErrorEvent = 'downloadError';

	public placeholder: imageSource.ImageSource;
	public maxRequests = 5;
	private _enabled = true;

	private _pendingDownloads = {};
	private _queue: Array<DownloadRequest> = [];
	private _currentDownloads = 0;

	public enableDownload() {
		if (this._enabled) {
			return;
		}

		// schedule all pending downloads
		this._enabled = true;
		let request: DownloadRequest;

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
			const existingRequest = <DownloadRequest>this._pendingDownloads[request.key];
			this._mergeRequests(existingRequest, request);
		} else {
			// TODO: Potential performance bottleneck - traversing the whole queue on each download request.
			let queueRequest: DownloadRequest;
			for (let i = 0; i < this._queue.length; i++) {
				if (this._queue[i].key === request.key) {
					queueRequest = this._queue[i];
					break;
				}
			}

			if (queueRequest) {
				this._mergeRequests(queueRequest, request);
			} else {
				if (this._shouldDownload(request, onTop)) {
					this._download(request);
				}
			}
		}
	}

	private _mergeRequests(existingRequest: DownloadRequest, newRequest: DownloadRequest) {
		if (existingRequest.completed) {
			if (newRequest.completed) {
				const existingCompleted = existingRequest.completed;
				const stackCompleted = function (result: imageSource.ImageSource, key: string) {
					existingCompleted(result, key);
					newRequest.completed(result, key);
				};

				existingRequest.completed = stackCompleted;
			}
		} else {
			existingRequest.completed = newRequest.completed;
		}
		if (existingRequest.error) {
			if (newRequest.error) {
				const existingError = existingRequest.error;
				const stackError = function (key: string) {
					existingError(key);
					newRequest.error(key);
				};

				existingRequest.error = stackError;
			}
		} else {
			existingRequest.error = newRequest.error;
		}
	}

	public get(key: string): any {
		// This method is intended to be overridden by the android and ios implementations
		throw new Error('Abstract');
	}

	public set(key: string, image: any): void {
		// This method is intended to be overridden by the android and ios implementations
		throw new Error('Abstract');
	}

	public remove(key: string): void {
		// This method is intended to be overridden by the android and ios implementations
		throw new Error('Abstract');
	}

	public clear() {
		// This method is intended to be overridden by the android and ios implementations
		throw new Error('Abstract');
	}

	/* tslint:disable:no-unused-variable */
	public _downloadCore(request: definition.DownloadRequest) {
		// This method is intended to be overridden by the android and ios implementations
		throw new Error('Abstract');
	}
	/* tslint:enable:no-unused-variable */

	public _onDownloadCompleted(key: string, image: any) {
		const request = <DownloadRequest>this._pendingDownloads[key];

		this.set(request.key, image);
		this._currentDownloads--;

		if (request.completed) {
			request.completed(image, request.key);
		}

		if (this.hasListeners(Cache.downloadedEvent)) {
			this.notify({
				eventName: Cache.downloadedEvent,
				object: this,
				key: key,
				image: image,
			});
		}

		delete this._pendingDownloads[request.key];

		this._updateQueue();
	}

	public _onDownloadError(key: string, err: Error) {
		const request = <DownloadRequest>this._pendingDownloads[key];
		this._currentDownloads--;

		if (request.error) {
			request.error(request.key);
		}

		if (this.hasListeners(Cache.downloadErrorEvent)) {
			this.notify({
				eventName: Cache.downloadErrorEvent,
				object: this,
				key: key,
				error: err,
			});
		}

		delete this._pendingDownloads[request.key];

		this._updateQueue();
	}

	private _shouldDownload(request: definition.DownloadRequest, onTop: boolean): boolean {
		if (this.get(request.key) || request.key in this._pendingDownloads) {
			return false;
		}

		if (this._currentDownloads >= this.maxRequests || !this._enabled) {
			if (onTop) {
				this._queue.push(request);
			} else {
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

		const request = this._queue.pop();
		this._download(request);
	}
}
export interface Cache {
	on(eventNames: string, callback: (args: observable.EventData) => void, thisArg?: any);
	on(event: 'downloaded', callback: (args: definition.DownloadedData) => void, thisArg?: any);
	on(event: 'downloadError', callback: (args: definition.DownloadError) => void, thisArg?: any);
}
