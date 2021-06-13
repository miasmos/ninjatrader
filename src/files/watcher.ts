import fs from "fs";
import { EventEmitter } from "events";
import { isAfter } from "date-fns";
import { FileEvent } from "../enum";

interface WatcherOptions {
    path: string;
    frequency?: number;
    monitor?: boolean;
}

declare interface Watcher {
    on(event: FileEvent.Modified, listener: (file: string) => void): this;
}

class Watcher extends EventEmitter {
    path: string;
    monitor: boolean = true;
    frequency: number = 1000;
    interval: NodeJS.Timeout;
    lastModified: Date;

    constructor({ path, frequency, monitor }: WatcherOptions) {
        super();
        this.path = path;
        if (frequency) {
            this.frequency = frequency;
        }
        if (typeof monitor === "boolean") {
            this.monitor = monitor;
        }
        if (this.monitor) {
            this.read();
            this.interval = setInterval(this.read.bind(this), frequency);
        }
    }

    async read() {
        try {
            const { mtime } = await fs.promises.stat(this.path);
            const wasModified = !this.lastModified || isAfter(mtime, this.lastModified);

            if (!wasModified) {
                return undefined;
            }
            this.lastModified = mtime;

            const file = await fs.promises.readFile(this.path, "utf8");
            this.emit(FileEvent.Modified, file);
            return file;
        } catch {} // file not found / inaccessible

        return undefined;
    }
}

export default Watcher;
