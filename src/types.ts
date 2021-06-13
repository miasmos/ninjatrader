import EventEmitter from "events";
import {
    MarketPosition,
    NinjaTraderAction,
    NinjaTraderOrderType,
    NinjaTraderTif,
    OrderStatus,
} from "./enum";
import Watcher from "./files/watcher";

interface NinjaTraderOrderOptions {
    onUpdate?: (status: OrderStatus, order: OrderState) => void;
    onFilled?: (order: OrderState) => void;
    onInitialized?: (order: OrderState) => void;
    onSubmitted?: (order: OrderState) => void;
    onWorking?: (order: OrderState) => void;
    onAccepted?: (order: OrderState) => void;
    onChangeSubmitted?: (order: OrderState) => void;
    onCancelPending?: (order: OrderState) => void;
    onCancelled?: (order: OrderState) => void;
    onRejected?: (order: OrderState) => void;
    onPartiallyFilled?: (order: OrderState) => void;
    onTriggerPending?: (order: OrderState) => void;
}

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

interface StateOptions {
    path: string;
}

interface OrderStateOptions extends StateOptions, NinjaTraderOrderOptions {
    orderId: string;
    account: string;
}

interface ConnectionStateOptions extends StateOptions {
    connection: string;
    onConnected?: () => void;
    onDisconnected?: () => void;
    onUpdate?: (connected: boolean) => void;
}

interface PositionUpdateStateOptions extends StateOptions {
    instrument: string;
    account: string;
    onUpdate?: (order: PositionUpdateState) => void;
}

interface OrderState {
    quantity: number;
    price: number;
}

interface ConnectionState {
    connected: boolean;
}

interface StateWatcher extends EventEmitter {
    path: string;
    watcher: Watcher;
}

interface PositionUpdateState {
    position: MarketPosition;
    quantity: number;
    price: number;
}

type NinjaTraderMarket = Omit<PlaceCommand, "orderType" | "account">;

type NinjaTraderMarketOptions = NinjaTraderOrderOptions & NinjaTraderMarket;

type NinjaTraderLimit = Omit<PlaceCommand, "orderType" | "account" | "limitPrice"> &
    Required<Pick<PlaceCommand, "limitPrice">>;

type NinjaTraderLimitOptions = NinjaTraderOrderOptions & NinjaTraderLimit;

type NinjaTraderStop = Omit<PlaceCommand, "orderType" | "account" | "limitPrice"> &
    Required<Pick<PlaceCommand, "stopPrice">>;

type NinjaTraderStopOptions = NinjaTraderOrderOptions & NinjaTraderStop;

type NinjaTraderStopLimit = Omit<PlaceCommand, "orderType" | "account" | "limitPrice"> &
    Required<Pick<PlaceCommand, "stopPrice" | "limitPrice">>;

type NinjaTraderStopLimitOptions = NinjaTraderOrderOptions & NinjaTraderStopLimit;

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
    OrderStateOptions,
    PositionUpdateStateOptions,
    ConnectionStateOptions,
    OrderState,
    ConnectionState,
    PositionUpdateState,
    StateWatcher,
    NinjaTraderOptions,
    NinjaTraderOrderOptions,
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
    NinjaTraderAllCommands,
};
