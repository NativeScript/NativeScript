import { on, off, lowMemoryEvent } from "tns-core-modules/application";

export namespace FSWorker {

  export interface FSJob {
    id: string;
    onError: { (error: any): void };
    onSuccess: { (message: any): void };
  }

  export enum WorkType {
    file,
    folder,
    entity,
    worker
  }

  export enum WorkTask {
    readText,
    writeText,
    clearFolder,
    getEntities,
    removeEntity,
    renameEntity,
    closeWorker,
    turnOffActivityObserver
  }

  export enum State {
    inactive = "WorkerBecameInactive",
    closed = "WorkerCloseRequestFulfilled"
  }

  export let fileWorker: Instance;
  export const isRunning = (): boolean => fileWorker instanceof Instance;
  export const getWorkerInstance = (): Instance => fileWorker;
  export const createWorkerInstance = (): Instance =>
    (fileWorker = new Instance());

  export const onMemoryEvent = (callback, thisArg) =>
    on(lowMemoryEvent, callback, thisArg);
  export const offMemoryEvent = (callback, thisArg) =>
    off(lowMemoryEvent, callback, thisArg);

  export class Job {
    id: string;
    object: any;
    task: WorkTask;
    type: WorkType;

    constructor(type: WorkType, task: WorkTask, object?: any) {
      this.id = `${type}-${task}-${Date.now()}`;
      this.object = object;
      this.task = task;
      this.type = type;
    }
  }

  export class Instance {
    private _worker: Worker;
    private _jobs: FSJob[];

    constructor() {
      this._jobs = [];
      this._worker = new Worker("./worker");
      this._worker.onerror = error => {
        const data = JSON.parse(error.message);
        this.getJob(data.id).onError(new Error(data.message));
      };
      this._worker.onmessage = message => {
        const data = message.data;
        switch (data.id) {
          case "WorkerCloseRequestFulfilled":
            this.onWorkerClosed();
            break;
          case "WorkerBecameInactive":
            this.onWorkerClosed();
            break;
          default:
            this.getJob(data.id).onSuccess(data.message);
        }
      };
      FSWorker.onMemoryEvent(this.closeWorker, this);
    }

    public get jobs() {
      return this._jobs;
    }

    public getJob(id: string): FSJob {
      const job = this.jobs.find(job => job.id === id);
      this.jobs.splice(this.jobs.indexOf(job), 1);
      return job;
    }

    public postJob(job: Job, onSuccess, onError): void {
      this.jobs.push({ id: job.id, onSuccess, onError });
      this._worker.postMessage(job);
    }

    keepAlive(callback: { (message: string): void } = (): void => {}) {
      this.postJob(
        new Job(WorkType.worker, WorkTask.turnOffActivityObserver),
        callback,
        callback
      );
    }

    terminate() {
      this.keepAlive(() => {
        this._worker.terminate();
        this.onWorkerClosed();
      });
    }

    closeWorker() {
      this._worker.postMessage({
        id: State.closed,
        type: WorkType.worker,
        task: WorkTask.closeWorker
      });
    }

    onWorkerClosed() {
      FSWorker.offMemoryEvent(this.closeWorker, this);
      this.jobs.splice(0, this.jobs.length - 1);
      fileWorker = null;
    }
  }
}

export class WorkerTimer {
  private _id: any;
  private _time: number;
  private _duration: number;
  private _observing: boolean;
  private _onEnd: { (): void };
  private _becameInactive: boolean;

  constructor(onEnd) {
    this._becameInactive = false;
    this._duration = 120000;
    this._observing = true;
    this._onEnd = onEnd;
    this._time = 0;

    this.startTimer();
  }

  private _incrementTime() {
    this._time += 1000;
    if (this._time >= this._duration) {
      this.stopTimer();
      this._becameInactive = true;
      this._onEnd();
    }
  }

  private get _isRunning() {
    return typeof this._id === "number";
  }

  private get _isObserving() {
    return this._observing;
  }

  public get becameInactive() {
    return this._becameInactive;
  }

  public stopObserving() {
    this.stopTimer();
    this._observing = false;
  }

  public startTimer() {
    if (this._isObserving && !this._isRunning) {
      this._id = setInterval(() => this._incrementTime(), 1000);
    }
  }

  public stopTimer() {
    if (this._isObserving && this._isRunning) {
      clearInterval(this._id);
      this._id = null;
    }
  }
}
