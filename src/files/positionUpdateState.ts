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
    state: PositionUpdateState;

    constructor({ path, account, instrument, onUpdate }: PositionUpdateStateOptions) {
        super();
        this.account = account;
        this.instrument = instrument;
        if (path) {
            this.path = path;
        }
        if (typeof onUpdate === "function") {
            this.onUpdate(onUpdate);
        }

        this.watcher = new Watcher({
            path: `${this.path}\\outgoing\\${this.instrument} Default_${this.account}_position.txt`,
            frequency: 100,
        });
        this.watcher.on(FileEvent.Modified, this.onModified.bind(this));
    }

    private onModified(file: string) {
        const [position, quantity, price] = file.trim().split(";");
        const state: PositionUpdateState = {
            position: position as MarketPosition,
            quantity: Number(quantity),
            price: Number(price),
        };
        const shouldUpdate =
            !this.state ||
            this.state.position !== state.position ||
            this.state.quantity !== state.quantity ||
            this.state.price !== state.price;

        if (shouldUpdate) {
            this.emit(PositionStatus.Update, state);
        }
    }

    onUpdate(callback: (order: PositionUpdateState) => void) {
        this.on(PositionStatus.Update, callback);
    }

    get position(): MarketPosition {
        if (this.state) {
            return this.state.position;
        }
        return MarketPosition.None;
    }

    get quantity(): number {
        if (this.state) {
            return this.state.quantity;
        }
        return 0;
    }

    get price(): number {
        if (this.state) {
            return this.state.price;
        }
        return 0;
    }
}

export default PositionUpdateWatcher;
