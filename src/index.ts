import fs from "fs";
import {
    NinjaTraderAction,
    NinjaTraderCommand,
    NinjaTraderOrderType,
    NinjaTraderTif,
} from "./enum";
import {
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
} from "./types";

class NinjaTrader {
    account: string = "Sim101";
    path: string = `${process.env.USERPROFILE!}\\Documents\\NinjaTrader 8`;

    constructor(options?: NinjaTraderOptions) {
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

    market(options: NinjaTraderMarket) {
        return this.submitOrder({
            account: this.account,
            ...options,
            command: NinjaTraderCommand.Place,
            orderType: NinjaTraderOrderType.Market,
        });
    }

    marketMany(options: NinjaTraderMarket[]) {
        return this.submitOrders(
            options.map(option => ({
                account: this.account,
                ...option,
                command: NinjaTraderCommand.Place,
                orderType: NinjaTraderOrderType.Market,
            }))
        );
    }

    limit(options: NinjaTraderLimit) {
        return this.submitOrder({
            account: this.account,
            ...options,
            command: NinjaTraderCommand.Place,
            orderType: NinjaTraderOrderType.Limit,
        });
    }

    limitMany(options: NinjaTraderLimit[]) {
        return this.submitOrders(
            options.map(option => ({
                account: this.account,
                ...option,
                command: NinjaTraderCommand.Place,
                orderType: NinjaTraderOrderType.Limit,
            }))
        );
    }

    stop(options: NinjaTraderStop) {
        return this.submitOrder({
            account: this.account,
            ...options,
            command: NinjaTraderCommand.Place,
            orderType: NinjaTraderOrderType.Stop,
        });
    }

    stopMany(options: NinjaTraderStop[]) {
        return this.submitOrders(
            options.map(option => ({
                account: this.account,
                ...option,
                command: NinjaTraderCommand.Place,
                orderType: NinjaTraderOrderType.Stop,
            }))
        );
    }

    stopLimit(options: NinjaTraderStopLimit) {
        return this.submitOrder({
            account: this.account,
            ...options,
            command: NinjaTraderCommand.Place,
            orderType: NinjaTraderOrderType.StopLimit,
        });
    }

    stopLimitMany(options: NinjaTraderStopLimit[]) {
        return this.submitOrders(
            options.map(option => ({
                account: this.account,
                ...option,
                command: NinjaTraderCommand.Place,
                orderType: NinjaTraderOrderType.StopLimit,
            }))
        );
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

    submitOrder(command: NinjaTraderAllCommands) {
        return this.submitOrders([command]);
    }

    submitOrders(commands: NinjaTraderAllCommands[]) {
        return fs.promises.writeFile(
            `${this.path}\\incoming\\oif.${Math.random().toString().substring(2)}.txt`,
            commands.map(command => NinjaTrader.buildCommand(command)).join("\n")
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
export { NinjaTraderCommand, NinjaTraderAction, NinjaTraderOrderType, NinjaTraderTif };
export {
    NinjaTraderOptions,
    NinjaTraderMarket,
    NinjaTraderLimit,
    NinjaTraderCancel,
    NinjaTraderChange,
    NinjaTraderClose,
    NinjaTraderCloseStrategy,
    NinjaTraderReverse,
};
