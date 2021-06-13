import { EventEmitter } from "events";
import { ConnectionStatus, FileEvent } from "../enum";
import { ConnectionStateOptions, StateWatcher } from "../types";
import Watcher from "./watcher";

declare interface ConnectionStateWatcher {
    on(event: ConnectionStatus.Connected, listener: () => void): this;
    on(event: ConnectionStatus.Disconnected, listener: () => void): this;
    on(event: ConnectionStatus.Update, listener: (connected: boolean) => void): this;
}

class ConnectionStateWatcher extends EventEmitter implements StateWatcher {
    path: string = `${process.env.USERPROFILE!}\\Documents\\NinjaTrader 8`;
    connection: string;
    watcher: Watcher;
    state: string;

    constructor({
        connection,
        path,
        onConnected,
        onDisconnected,
        onUpdate,
    }: ConnectionStateOptions) {
        super();
        this.connection = connection;
        if (path) {
            this.path = path;
        }
        if (typeof onConnected === "function") {
            this.onConnected(onConnected);
        }
        if (typeof onDisconnected === "function") {
            this.onDisconnected(onDisconnected);
        }
        if (typeof onUpdate === "function") {
            this.onUpdate(onUpdate);
        }

        this.watcher = new Watcher({
            path: `${this.path}\\outgoing\\${this.connection}.txt`,
            frequency: 100,
        });
        this.watcher.on(FileEvent.Modified, this.onModified.bind(this));
    }

    private onModified(file: string) {
        const status = file.trim();
        const shouldUpdate = status !== this.state && status.length > 0;

        if (!shouldUpdate) {
            return;
        }
        this.state = status;
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
        this.emit(ConnectionStatus.Update, status === ConnectionStatus.Connected ? true : false);
    }

    onConnected(callback: () => void) {
        this.on(ConnectionStatus.Connected, callback);
    }

    onDisconnected(callback: () => void) {
        this.on(ConnectionStatus.Disconnected, callback);
    }

    onUpdate(callback: (connected: boolean) => void) {
        this.on(ConnectionStatus.Update, callback);
    }

    get connected(): boolean {
        return this.state === ConnectionStatus.Connected ? true : false;
    }
}

export default ConnectionStateWatcher;
