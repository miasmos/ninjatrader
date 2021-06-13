import { EventEmitter } from "events";
import { FileEvent, OrderStatus } from "../enum";
import { OrderState, OrderStateOptions, StateWatcher } from "../types";
import Watcher from "./watcher";

declare interface OrderStateWatcher {
    on(event: OrderStatus.Filled, listener: (order: OrderState) => void): this;
    on(event: OrderStatus.Initialized, listener: (order: OrderState) => void): this;
    on(event: OrderStatus.Submitted, listener: (order: OrderState) => void): this;
    on(event: OrderStatus.Accepted, listener: (order: OrderState) => void): this;
    on(event: OrderStatus.Working, listener: (order: OrderState) => void): this;
    on(event: OrderStatus.ChangeSubmitted, listener: (order: OrderState) => void): this;
    on(event: OrderStatus.CancelPending, listener: (order: OrderState) => void): this;
    on(event: OrderStatus.Cancelled, listener: (order: OrderState) => void): this;
    on(event: OrderStatus.Rejected, listener: (order: OrderState) => void): this;
    on(event: OrderStatus.PartiallyFilled, listener: (order: OrderState) => void): this;
    on(event: OrderStatus.TriggerPending, listener: (order: OrderState) => void): this;
}

class OrderStateWatcher extends EventEmitter implements StateWatcher {
    path: string = `${process.env.USERPROFILE!}\\Documents\\NinjaTrader 8`;
    account: string;
    orderId: string;
    watcher: Watcher;

    constructor({ orderId, path, account }: OrderStateOptions) {
        super();
        this.orderId = orderId;
        this.account = account;
        if (path) {
            this.path = path;
        }

        this.watcher = new Watcher({
            path: `${this.path}\\outgoing\\${this.account}_${this.orderId}.txt`,
            frequency: 100,
        });
        this.watcher.on(FileEvent.Modified, this.onModified.bind(this));
    }

    onModified(file: string) {
        const [status, quantity, price] = file.trim().split(";");
        const shouldUpdate = status && quantity && price;
        if (!shouldUpdate) {
            return;
        }

        this.emit(status, { quantity: Number(quantity), price: Number(price) });
    }
}

export default OrderStateWatcher;
