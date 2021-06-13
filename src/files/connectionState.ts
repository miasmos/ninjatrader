import { EventEmitter } from "events";
import { ConnectionStatus, FileEvent } from "../enum";
import { ConnectionStateOptions, StateWatcher } from "../types";
import Watcher from "./watcher";

declare interface ConnectionStateWatcher {
    on(event: ConnectionStatus.Connected, listener: () => void): this;
    on(event: ConnectionStatus.Disconnected, listener: () => void): this;
}

class ConnectionStateWatcher extends EventEmitter implements StateWatcher {
    path: string = `${process.env.USERPROFILE!}\\Documents\\NinjaTrader 8`;
    connection: string;
    watcher: Watcher;
    lastState: string;

    constructor({ connection, path }: ConnectionStateOptions) {
        super();
        this.connection = connection;
        if (path) {
            this.path = path;
        }

        this.watcher = new Watcher({
            path: `${this.path}\\outgoing\\${this.connection}.txt`,
            frequency: 100,
        });
        this.watcher.on(FileEvent.Modified, this.onModified.bind(this));
    }

    onModified(file: string) {
        const status = file.trim();
        const shouldUpdate = status !== this.lastState && status.length > 0;

        if (!shouldUpdate) {
            return;
        }
        this.lastState = status;
        switch (status) {
            case ConnectionStatus.Connected:
                this.emit(ConnectionStatus.Connected);
                break;
            case ConnectionStatus.Disconnected:
                this.emit(ConnectionStatus.Disconnected);
                break;
            default:
            // noop
        }
    }

    get connected(): boolean {
        return this.lastState === ConnectionStatus.Connected ? true : false;
    }
}

export default ConnectionStateWatcher;
