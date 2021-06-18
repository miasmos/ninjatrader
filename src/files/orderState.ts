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
    on(event: OrderStatus.Update, listener: (status: OrderStatus, order: OrderState) => void): this;
}

class OrderStateWatcher extends EventEmitter implements StateWatcher {
    path = `${process.env.USERPROFILE!}\\Documents\\NinjaTrader 8`;
    account: string;
    orderId: string;
    watcher: Watcher;
    status: OrderStatus | undefined;
    state: OrderState | undefined;

    constructor({
        orderId,
        path,
        account,
        onUpdate,
        onFilled,
        onInitialized,
        onSubmitted,
        onWorking,
        onAccepted,
        onChangeSubmitted,
        onCancelPending,
        onCancelled,
        onRejected,
        onPartiallyFilled,
        onTriggerPending,
    }: OrderStateOptions) {
        super();
        this.orderId = orderId;
        this.account = account;
        if (path) {
            this.path = path;
        }
        if (typeof onUpdate === "function") {
            this.onUpdate(onUpdate);
        }
        if (typeof onFilled === "function") {
            this.onFilled(onFilled);
        }
        if (typeof onInitialized === "function") {
            this.onInitialized(onInitialized);
        }
        if (typeof onSubmitted === "function") {
            this.onSubmitted(onSubmitted);
        }
        if (typeof onWorking === "function") {
            this.onWorking(onWorking);
        }
        if (typeof onAccepted === "function") {
            this.onAccepted(onAccepted);
        }
        if (typeof onChangeSubmitted === "function") {
            this.onChangeSubmitted(onChangeSubmitted);
        }
        if (typeof onCancelPending === "function") {
            this.onCancelPending(onCancelPending);
        }
        if (typeof onCancelled === "function") {
            this.onCancelled(onCancelled);
        }
        if (typeof onRejected === "function") {
            this.onRejected(onRejected);
        }
        if (typeof onPartiallyFilled === "function") {
            this.onPartiallyFilled(onPartiallyFilled);
        }
        if (typeof onTriggerPending === "function") {
            this.onTriggerPending(onTriggerPending);
        }

        this.watcher = new Watcher({
            path: `${this.path}\\outgoing\\${this.account}_${this.orderId}.txt`,
            frequency: 100,
        });
        this.watcher.on(FileEvent.Modified, this.onModified.bind(this));
    }

    onFilled(callback: (order: OrderState) => void): void {
        this.on(OrderStatus.Filled, callback);
    }

    onInitialized(callback: (order: OrderState) => void): void {
        this.on(OrderStatus.Initialized, callback);
    }

    onSubmitted(callback: (order: OrderState) => void): void {
        this.on(OrderStatus.Submitted, callback);
    }

    onAccepted(callback: (order: OrderState) => void): void {
        this.on(OrderStatus.Accepted, callback);
    }

    onWorking(callback: (order: OrderState) => void): void {
        this.on(OrderStatus.Working, callback);
    }

    onChangeSubmitted(callback: (order: OrderState) => void): void {
        this.on(OrderStatus.ChangeSubmitted, callback);
    }

    onCancelPending(callback: (order: OrderState) => void): void {
        this.on(OrderStatus.CancelPending, callback);
    }

    onCancelled(callback: (order: OrderState) => void): void {
        this.on(OrderStatus.Cancelled, callback);
    }

    onRejected(callback: (order: OrderState) => void): void {
        this.on(OrderStatus.Rejected, callback);
    }

    onPartiallyFilled(callback: (order: OrderState) => void): void {
        this.on(OrderStatus.PartiallyFilled, callback);
    }

    onTriggerPending(callback: (order: OrderState) => void): void {
        this.on(OrderStatus.TriggerPending, callback);
    }

    onUpdate(callback: (status: OrderStatus, order: OrderState) => void): void {
        this.on(OrderStatus.Update, callback);
    }

    private onModified(file: string): void {
        const [status, quantity, price] = file.trim().split(";");
        const shouldUpdate =
            status &&
            quantity &&
            price &&
            ((!this.status && !this.state) ||
                this.status !== (status as OrderStatus) ||
                this.state!.price !== Number(price) ||
                this.state!.quantity !== Number(quantity));
        if (!shouldUpdate) {
            return;
        }
        this.status = status as OrderStatus;
        this.state = { quantity: Number(quantity), price: Number(price) };
        this.emit(status, this.state);
        this.emit(OrderStatus.Update, status, this.state);
    }

    get price(): number {
        if (this.state) {
            return this.state.price;
        }
        return 0;
    }

    get quantity(): number {
        if (this.state) {
            return this.state.quantity;
        }
        return 0;
    }
}

export default OrderStateWatcher;
