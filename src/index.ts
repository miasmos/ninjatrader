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
    NinjaTraderAllCommands,
    NinjaTraderCancel,
    NinjaTraderChange,
    NinjaTraderClose,
    NinjaTraderCloseStrategy,
    NinjaTraderLimit,
    NinjaTraderLimitOptions,
    NinjaTraderMarket,
    NinjaTraderMarketOptions,
    NinjaTraderOptions,
    NinjaTraderReverse,
    NinjaTraderStop,
    NinjaTraderStopOptions,
    NinjaTraderStopLimit,
    NinjaTraderStopLimitOptions,
    OrderState,
    PlaceCommand,
    PositionUpdateState,
    StateWatcher,
    NinjaTraderOrderOptions,
} from "./types";
import OrderStateWatcher from "./files/orderState";
import Util from "./util";
import ConnectionStateWatcher from "./files/connectionState";
import PositionUpdateWatcher from "./files/positionUpdateState";

class NinjaTrader extends EventEmitter {
    account = "Sim101";
    path = `${process.env.USERPROFILE!}\\Documents\\NinjaTrader 8`;
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

    onConnected(connection: string, callback: () => void): ConnectionStateWatcher {
        let watcher: ConnectionStateWatcher;
        if (connection in this.watchers) {
            watcher = this.watchers[connection] as ConnectionStateWatcher;
        } else {
            watcher = new ConnectionStateWatcher({
                connection,
                path: this.path,
            });
            this.watchers[connection] = watcher;
        }

        watcher.onConnected(callback);
        return watcher;
    }

    onDisconnected(connection: string, callback: () => void): ConnectionStateWatcher {
        let watcher: ConnectionStateWatcher;
        if (connection in this.watchers) {
            watcher = this.watchers[connection] as ConnectionStateWatcher;
        } else {
            watcher = new ConnectionStateWatcher({
                connection,
                path: this.path,
            });
            this.watchers[connection] = watcher;
        }

        watcher.onDisconnected(callback);
        return watcher;
    }

    onConnection(
        connection: string,
        callback: (connected: boolean) => void
    ): ConnectionStateWatcher {
        let watcher: ConnectionStateWatcher;
        if (connection in this.watchers) {
            watcher = this.watchers[connection] as ConnectionStateWatcher;
        } else {
            watcher = new ConnectionStateWatcher({
                connection,
                path: this.path,
            });
            this.watchers[connection] = watcher;
        }

        watcher.onUpdate(callback);
        return watcher;
    }

    onPosition(
        instrument: string,
        callback: (state: PositionUpdateState) => void
    ): PositionUpdateWatcher {
        let watcher: PositionUpdateWatcher;
        if (instrument in this.watchers) {
            watcher = this.watchers[instrument] as PositionUpdateWatcher;
        } else {
            watcher = new PositionUpdateWatcher({
                account: this.account,
                instrument,
                path: this.path,
            });
            this.watchers[instrument] = watcher;
        }

        watcher.onUpdate(callback);
        return watcher;
    }

    market(options: NinjaTraderMarketOptions): Promise<OrderStateWatcher> {
        return this.submitOrderAndWatch({
            account: this.account,
            ...options,
            command: NinjaTraderCommand.Place,
            orderType: NinjaTraderOrderType.Market,
        });
    }

    marketMany(options: NinjaTraderMarketOptions[]): Promise<OrderStateWatcher[]> {
        return Promise.all(options.map(option => this.market(option)));
    }

    limit(options: NinjaTraderLimitOptions): Promise<OrderStateWatcher> {
        return this.submitOrderAndWatch({
            account: this.account,
            ...options,
            command: NinjaTraderCommand.Place,
            orderType: NinjaTraderOrderType.Limit,
        });
    }

    limitMany(options: NinjaTraderLimitOptions[]): Promise<OrderStateWatcher[]> {
        return Promise.all(options.map(option => this.limit(option)));
    }

    stop(options: NinjaTraderStopOptions): Promise<OrderStateWatcher> {
        return this.submitOrderAndWatch({
            account: this.account,
            ...options,
            command: NinjaTraderCommand.Place,
            orderType: NinjaTraderOrderType.Stop,
        });
    }

    stopMany(options: NinjaTraderStopOptions[]): Promise<OrderStateWatcher[]> {
        return Promise.all(options.map(option => this.stop(option)));
    }

    stopLimit(options: NinjaTraderStopLimitOptions): Promise<OrderStateWatcher> {
        return this.submitOrderAndWatch({
            account: this.account,
            ...options,
            command: NinjaTraderCommand.Place,
            orderType: NinjaTraderOrderType.StopLimit,
        });
    }

    stopLimitMany(options: NinjaTraderStopLimitOptions[]): Promise<OrderStateWatcher[]> {
        return Promise.all(options.map(option => this.stopLimit(option)));
    }

    cancel(options: NinjaTraderCancel): Promise<void> {
        return this.submitOrder({
            ...options,
            command: NinjaTraderCommand.Cancel,
        });
    }

    change(options: NinjaTraderChange): Promise<void> {
        return this.submitOrder({
            ...options,
            command: NinjaTraderCommand.Change,
        });
    }

    close(options: NinjaTraderClose): Promise<void> {
        return this.submitOrder({
            ...options,
            command: NinjaTraderCommand.ClosePosition,
        });
    }

    closeStrategy(options: NinjaTraderCloseStrategy): Promise<void> {
        return this.submitOrder({
            ...options,
            command: NinjaTraderCommand.CloseStrategy,
        });
    }

    cancelAll(): Promise<void> {
        return this.submitOrder({
            command: NinjaTraderCommand.CancelAllOrders,
        });
    }

    flatten(): Promise<void> {
        return this.submitOrder({
            command: NinjaTraderCommand.FlattenEverything,
        });
    }

    reverse(options: NinjaTraderReverse): Promise<void> {
        return this.submitOrder({
            command: NinjaTraderCommand.ReversePosition,
            account: this.account,
            ...options,
        });
    }

    private async submitOrderAndWatch({
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
        ...options
    }: NinjaTraderOrderOptions & PlaceCommand & { command: string }): Promise<OrderStateWatcher> {
        if (typeof options.orderId !== "string") {
            options.orderId = Math.random().toString().substring(2);
        }

        const order = new OrderStateWatcher({
            orderId: options.orderId!,
            path: this.path,
            account: this.account,
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
        });
        await this.submitOrder(options);
        await Util.eventAsync<OrderState>(order, OrderStatus.Submitted);
        return order;
    }

    private submitOrder(command: NinjaTraderAllCommands): Promise<void> {
        return fs.promises.writeFile(
            `${this.path}\\incoming\\oif.${Math.random().toString().substring(2)}.txt`,
            NinjaTrader.buildCommand(command as unknown as PlaceCommand & { command: string })
        );
    }

    private static buildCommand({
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
    }: PlaceCommand & { command: string }): string {
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
    OrderStatus,
    ConnectionStatus,
    PositionStatus,
    OrderStateWatcher,
    PositionUpdateWatcher,
    ConnectionStateWatcher,
    NinjaTraderOptions,
    NinjaTraderMarket,
    NinjaTraderMarketOptions,
    NinjaTraderLimit,
    NinjaTraderLimitOptions,
    NinjaTraderStop,
    NinjaTraderStopOptions,
    NinjaTraderStopLimit,
    NinjaTraderStopLimitOptions,
    NinjaTraderCancel,
    NinjaTraderChange,
    NinjaTraderClose,
    NinjaTraderCloseStrategy,
    NinjaTraderReverse,
};
