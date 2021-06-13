import { EventEmitter } from "events";
import { FileEvent, MarketPosition, PositionStatus } from "../enum";
import { PositionUpdateState, PositionUpdateStateOptions, StateWatcher } from "../types";
import Watcher from "./watcher";

declare interface PositionUpdateWatcher {
    on(event: PositionStatus.Update, listener: (order: PositionUpdateState) => void): this;
}

class PositionUpdateWatcher extends EventEmitter implements StateWatcher {
    path: string = `${process.env.USERPROFILE!}\\Documents\\NinjaTrader 8`;
    account: string;
    instrument: string;
    watcher: Watcher;
    lastState: PositionUpdateState;

    constructor({ path, account, instrument }: PositionUpdateStateOptions) {
        super();
        this.account = account;
        this.instrument = instrument;
        if (path) {
            this.path = path;
        }

        this.watcher = new Watcher({
            path: `${this.path}\\outgoing\\${this.instrument} Default_${this.account}_position.txt`,
            frequency: 100,
        });
        this.watcher.on(FileEvent.Modified, this.onModified.bind(this));
    }

    onModified(file: string) {
        const [position, quantity, price] = file.trim().split(";");
        const state: PositionUpdateState = {
            position: position as MarketPosition,
            quantity: Number(quantity),
            price: Number(price),
        };
        const shouldUpdate =
            !this.lastState ||
            this.lastState.position !== state.position ||
            this.lastState.quantity !== state.quantity ||
            this.lastState.price !== state.price;

        if (shouldUpdate) {
            this.emit(PositionStatus.Update, state);
        }
    }
}

export default PositionUpdateWatcher;
