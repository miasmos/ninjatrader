import { EventEmitter } from "events";
import fs from "fs";
import {
    NinjaTraderAction,
    NinjaTraderCommand,
    NinjaTraderOrderType,
    NinjaTraderTif,
    OrderStatus,
    NinjaTraderEvent,
    ConnectionStatus,
    PositionStatus,
} from "./enum";
import {
    ConnectionStateOptions,
    NinjaTraderAllCommands,
    NinjaTraderCancel,
    NinjaTraderChange,
    NinjaTraderClose,
    NinjaTraderCloseStrategy,
    NinjaTraderLimit,
    NinjaTraderMarket,
    NinjaTraderOptions,
    NinjaTraderReverse,
    NinjaTraderStop,
    NinjaTraderStopLimit,
    OrderState,
    PlaceCommand,
    PositionUpdateState,
    PositionUpdateStateOptions,
    StateWatcher,
} from "./types";
import OrderStateWatcher from "./files/orderState";
import Util from "./util";
import ConnectionStateWatcher from "./files/connectionState";
import PositionUpdateWatcher from "./files/positionUpdateState";

class NinjaTrader extends EventEmitter {
    account: string = "Sim101";
    path: string = `${process.env.USERPROFILE!}\\Documents\\NinjaTrader 8`;
    connections: string[] = [];
    watchers: { [key: string]: StateWatcher } = {};

    constructor(options?: NinjaTraderOptions) {
        super();
        if (options) {
            const { account, path } = options;
            if (account) {
                this.account = account;
            }
            if (path) {
                this.path = path;
            }
        }

        const userProfileDidExist = process.env.USERPROFILE !== undefined;
        if (options && !("path" in options) && !userProfileDidExist) {
            throw new Error(
                "NinjaTrader path is empty, please specify it within instantiation options"
            );
        }
    }

    onConnected(connection: string, callback: (connection: string) => void) {
        let watcher: StateWatcher;
        if (connection in this.watchers) {
            watcher = this.watchers[connection];
        } else {
            watcher = new ConnectionStateWatcher({
                connection,
                path: this.path,
            });
            this.watchers[connection] = watcher;
        }

        watcher.on(ConnectionStatus.Connected, callback);
    }

    onDisconnected(connection: string, callback: (connection: string) => void) {
        let watcher: StateWatcher;
        if (connection in this.watchers) {
            watcher = this.watchers[connection];
        } else {
            watcher = new ConnectionStateWatcher({
                connection,
                path: this.path,
            });
            this.watchers[connection] = watcher;
        }

        watcher.on(ConnectionStatus.Disconnected, callback);
    }

    onPositionChange(instrument: string, callback: (state: PositionUpdateState) => void) {
        let watcher: StateWatcher;
        const name = `${instrument}-${instrument}`;

        if (name in this.watchers) {
            watcher = this.watchers[name];
        } else {
            watcher = new PositionUpdateWatcher({
                account: this.account,
                instrument,
                path: this.path,
            });
            this.watchers[name] = watcher;
        }

        watcher.on(PositionStatus.Update, callback);
    }

    async market(options: NinjaTraderMarket): Promise<OrderState> {
        return this.submitOrderAndWatch({
            account: this.account,
            ...options,
            command: NinjaTraderCommand.Place,
            orderType: NinjaTraderOrderType.Market,
        });
    }

    marketMany(options: NinjaTraderMarket[]) {
        return Promise.all(options.map(option => this.market(option)));
    }

    limit(options: NinjaTraderLimit) {
        return this.submitOrderAndWatch({
            account: this.account,
            ...options,
            command: NinjaTraderCommand.Place,
            orderType: NinjaTraderOrderType.Limit,
        });
    }

    limitMany(options: NinjaTraderLimit[]) {
        return Promise.all(options.map(option => this.limit(option)));
    }

    stop(options: NinjaTraderStop) {
        return this.submitOrderAndWatch({
            account: this.account,
            ...options,
            command: NinjaTraderCommand.Place,
            orderType: NinjaTraderOrderType.Stop,
        });
    }

    stopMany(options: NinjaTraderStop[]) {
        return Promise.all(options.map(option => this.stop(option)));
    }

    stopLimit(options: NinjaTraderStopLimit) {
        return this.submitOrderAndWatch({
            account: this.account,
            ...options,
            command: NinjaTraderCommand.Place,
            orderType: NinjaTraderOrderType.StopLimit,
        });
    }

    stopLimitMany(options: NinjaTraderStopLimit[]) {
        return Promise.all(options.map(option => this.stopLimit(option)));
    }

    cancel(options: NinjaTraderCancel) {
        return this.submitOrder({
            ...options,
            command: NinjaTraderCommand.Cancel,
        });
    }

    change(options: NinjaTraderChange) {
        return this.submitOrder({
            ...options,
            command: NinjaTraderCommand.Change,
        });
    }

    close(options: NinjaTraderClose) {
        return this.submitOrder({
            ...options,
            command: NinjaTraderCommand.ClosePosition,
        });
    }

    closeStrategy(options: NinjaTraderCloseStrategy) {
        return this.submitOrder({
            ...options,
            command: NinjaTraderCommand.CloseStrategy,
        });
    }

    cancelAll() {
        return this.submitOrder({
            command: NinjaTraderCommand.CancelAllOrders,
        });
    }

    flatten() {
        return this.submitOrder({
            command: NinjaTraderCommand.FlattenEverything,
        });
    }

    reverse(options: NinjaTraderReverse) {
        return this.submitOrder({
            command: NinjaTraderCommand.ReversePosition,
            account: this.account,
            ...options,
        });
    }

    async submitOrderAndWatch(options: PlaceCommand & { command: string }): Promise<OrderState> {
        if (typeof options.orderId !== "string") {
            options.orderId = Math.random().toString().substring(2);
        }

        const order = new OrderStateWatcher({
            orderId: options.orderId!,
            path: this.path,
            account: this.account,
        });
        await this.submitOrder(options);
        const state = await Util.eventAsync<OrderState>(order, OrderStatus.Filled);
        return state;
    }

    submitOrder(command: NinjaTraderAllCommands) {
        return fs.promises.writeFile(
            `${this.path}\\incoming\\oif.${Math.random().toString().substring(2)}.txt`,
            NinjaTrader.buildCommand(command)
        );
    }

    static buildCommand({
        command,
        account,
        instrument,
        action,
        quantity,
        orderType,
        limitPrice,
        stopPrice,
        tif,
        ocoId,
        orderId,
        strategy,
        strategyId,
    }: any): string {
        return [
            command,
            account,
            instrument,
            action,
            quantity,
            orderType,
            limitPrice,
            stopPrice,
            tif,
            ocoId,
            orderId,
            strategy,
            strategyId,
        ].join(";");
    }
}

export default NinjaTrader;
export {
    NinjaTraderCommand,
    NinjaTraderAction,
    NinjaTraderOrderType,
    NinjaTraderTif,
    NinjaTraderEvent,
};
export {
    PositionUpdateState,
    OrderState,
    NinjaTraderOptions,
    NinjaTraderMarket,
    NinjaTraderLimit,
    NinjaTraderCancel,
    NinjaTraderChange,
    NinjaTraderClose,
    NinjaTraderCloseStrategy,
    NinjaTraderReverse,
};
