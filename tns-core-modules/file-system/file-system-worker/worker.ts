import "globals";
import { FileSystemAccess } from "../file-system-access";
import { FSWorker, WorkerTimer } from "./components";

interface Context extends Worker {
  close: { (): void };
  onclose: { (): void };
}

namespace Worker {
  declare let self: any;
  declare let fileAccess: FileSystemAccess;

  export const Jobs: string[] = [];
  export const context: Context = self;
  export const Timer = new WorkerTimer(context.close);

  export function postResult(id, message) {
    Jobs.splice(Jobs.indexOf(id), 1);
    context.postMessage({ id, message });
    if (Jobs.length < 1) this.Timer.startTimer();
  }

  export function onError<T>(error: T): void {
    if (error instanceof Error) throw error;
    if (typeof error === "string") throw new Error(error);
  }

  export function throwWorkerError(id: string, error: Error) {
    try {
      Jobs.splice(Jobs.indexOf(id), 1);
      throw JSON.stringify({ id, message: error.message });
    } finally {
      if (Jobs.length < 1) this.Timer.startTimer();
    }
  }

  export function performWork(work) {
    switch (work.task) {
      case FSWorker.WorkTask.closeWorker:
        context.close();
        break;
      case FSWorker.WorkTask.turnOffActivityObserver:
        this.Timer.stopObserving();
        this.postResult(work.id, "Stopped observing");
        break;
    }
  }

  export function getFileAccess() {
    if (!(this.fileAccess instanceof FileSystemAccess)) {
      this.fileAccess = new FileSystemAccess();
    }
    return this.fileAccess;
  }
}

namespace EntityWorker {
  export function performWork(work) {
    try {
      let result;
      switch (work.task) {
        case FSWorker.WorkTask.removeEntity:
          result = removeEntity(work.object);
          break;
        case FSWorker.WorkTask.renameEntity:
          result = renameEntity(work.object);
          break;
        default:
          throw new Error(`Unrecognised task ${work.task}`);
      }
      Worker.postResult(work.id, result);
    } catch (error) {
      Worker.throwWorkerError(work.id, error);
    }
  }

  function removeEntity(object: { path: string; isFile: boolean }) {
    object.isFile
      ? Worker.getFileAccess().deleteFile(object.path, Worker.onError)
      : Worker.getFileAccess().deleteFolder(object.path, Worker.onError);
    return `${object.isFile ? "File" : "Folder"} removed.`;
  }

  function renameEntity(object: {
    name: string;
    path: string;
    parentPath: string;
  }) {
    const path = Worker.getFileAccess().joinPath(
      object.parentPath,
      object.name
    );
    const extension = Worker.getFileAccess().getFileExtension(path);
    Worker.getFileAccess().rename(object.path, path, Worker.onError);
    return { name: object.name, path, extension };
  }
}

namespace FileWorker {
  export function performWork(work) {
    try {
      let result;
      switch (work.task) {
        case FSWorker.WorkTask.readText:
          result = readText(work.object);
          break;
        case FSWorker.WorkTask.writeText:
          result = writeText(work.object);
          break;
        default:
          throw new Error(`Unrecognised task ${work.task}`);
      }
      Worker.postResult(work.id, result);
    } catch (error) {
      Worker.throwWorkerError(work.id, error);
    }
  }

  function readText(object: { path: string; encoding?: string }) {
    const fileAccess = Worker.getFileAccess();
    const content = object.encoding
      ? fileAccess.readText(object.path, Worker.onError, object.encoding)
      : fileAccess.readText(object.path, Worker.onError);
    return content;
  }

  function writeText(object: {
    path: string;
    content: string;
    encoding?: string;
  }) {
    const fileAccess = Worker.getFileAccess();
    !object.encoding
      ? fileAccess.writeText(object.path, object.content, Worker.onError)
      : fileAccess.writeText(
          object.path,
          object.content,
          Worker.onError,
          object.encoding
        );
    return "Content written to file.";
  }
}

namespace FolderWorker {
  export function performWork(work) {
    try {
      let result;
      switch (work.task) {
        case FSWorker.WorkTask.clearFolder:
          result = clearFolder(work.object);
          break;
        case FSWorker.WorkTask.getEntities:
          result = getEntities(work.object);
          break;
        default:
          throw new Error(`Unrecognised task ${work.task}`);
      }
      Worker.postResult(work.id, result);
    } catch (error) {
      Worker.throwWorkerError(work.id, error);
    }
  }

  function clearFolder(object: { path: string }) {
    Worker.getFileAccess().emptyFolder(object.path, Worker.onError);
    return "Folder emptied";
  }

  function getEntities(object: { path: string }) {
    let i;
    const entities = [];
    const fileInfos = Worker.getFileAccess().getEntities(
      object.path,
      Worker.onError
    );
    if (!fileInfos) throw new Error("Path has no entities");
    for (i = 0; i < fileInfos.length; i++) {
      if (fileInfos[i].extension) {
        entities.push(fileInfos[i]);
      } else {
        entities.push(fileInfos[i]);
      }
    }

    return entities;
  }
}

Worker.context.onmessage = function(message) {
  const work = message.data;
  Worker.Timer.stopTimer();
  Worker.Jobs.push(work.id);
  switch (work.type) {
    case FSWorker.WorkType.entity:
      EntityWorker.performWork(work);
      break;
    case FSWorker.WorkType.file:
      FileWorker.performWork(work);
      break;
    case FSWorker.WorkType.folder:
      FolderWorker.performWork(work);
      break;
    case FSWorker.WorkType.worker:
      Worker.performWork(work);
      break;
  }
};

Worker.context.onclose = function() {
  const jobId = Worker.Jobs.find(id => FSWorker.State.closed === id);
  if (jobId) Worker.postResult(jobId, "Worker closed");
  if (Worker.Timer.becameInactive) {
    Worker.context.postMessage({
      id: FSWorker.State.inactive,
      message: "Worker did become inactive"
    });
  }
};
