import { NinjaTraderAction, NinjaTraderOrderType, NinjaTraderTif } from "./enum";

interface CancelCommand {
    orderId: string;
    strategyId?: string;
}

interface ChangeCommand {
    quantity: number;
    limitPrice?: number;
    stopPrice: number;
    orderId: string;
    strategyId?: string;
}

interface ClosePositionCommand {
    account: string;
    instrument: string;
}

interface CloseStrategyCommand {
    strategyId: string;
}

interface PlaceCommand {
    account: string;
    instrument: string;
    action: NinjaTraderAction;
    quantity: number;
    orderType: NinjaTraderOrderType;
    limitPrice?: number;
    stopPrice?: number;
    tif: NinjaTraderTif;
    ocoId?: string;
    orderId?: string;
    strategy?: string;
    strategyId?: string;
}

interface ReversePositionCommand {
    account: string;
    instrument: string;
    action: NinjaTraderAction;
    quantity: number;
    orderType: NinjaTraderOrderType;
    limitPrice?: number;
    stopPrice?: number;
    tif: NinjaTraderTif;
    ocoId?: string;
    orderId?: string;
    strategy?: string;
    strategyId?: string;
}

interface NinjaTraderOptions {
    account: string;
    path?: string;
}

type NinjaTraderMarket = Omit<PlaceCommand, "orderType" | "account">;

type NinjaTraderLimit = Omit<PlaceCommand, "orderType" | "account" | "limitPrice"> &
    Required<Pick<PlaceCommand, "limitPrice">>;

type NinjaTraderStop = Omit<PlaceCommand, "orderType" | "account" | "limitPrice"> &
    Required<Pick<PlaceCommand, "stopPrice">>;

type NinjaTraderStopLimit = Omit<PlaceCommand, "orderType" | "account" | "limitPrice"> &
    Required<Pick<PlaceCommand, "stopPrice" | "limitPrice">>;

type NinjaTraderCancel = CancelCommand;

type NinjaTraderChange = ChangeCommand;

type NinjaTraderClose = Omit<ClosePositionCommand, "account"> &
    Partial<Pick<ClosePositionCommand, "account">>;

type NinjaTraderCloseStrategy = CloseStrategyCommand;

type NinjaTraderReverse = Omit<ReversePositionCommand, "account"> &
    Partial<Pick<ReversePositionCommand, "account">>;

type NinjaTraderAllCommands =
    | ((
          | CancelCommand
          | PlaceCommand
          | ClosePositionCommand
          | ChangeCommand
          | ClosePositionCommand
          | CloseStrategyCommand
      ) & {
          command: string;
      })
    | {
          command: string;
      };

export {
    CancelCommand,
    ChangeCommand,
    ClosePositionCommand,
    CloseStrategyCommand,
    PlaceCommand,
    ReversePositionCommand,
    NinjaTraderOptions,
    NinjaTraderMarket,
    NinjaTraderLimit,
    NinjaTraderStop,
    NinjaTraderStopLimit,
    NinjaTraderCancel,
    NinjaTraderChange,
    NinjaTraderClose,
    NinjaTraderCloseStrategy,
    NinjaTraderReverse,
    NinjaTraderAllCommands,
};
