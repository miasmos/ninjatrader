enum NinjaTraderCommand {
    Place = "PLACE",
    ClosePosition = "CLOSEPOSITION",
    Cancel = "CANCEL",
    Change = "CHANGE",
    CancelAllOrders = "CANCELALLORDERS",
    CloseStrategy = "CLOSESTRATEGY",
    FlattenEverything = "FLATTENEVERYTHING",
    ReversePosition = "REVERSEPOSITION",
}

enum NinjaTraderAction {
    Buy = "BUY",
    Sell = "SELL",
}

enum NinjaTraderOrderType {
    Market = "MARKET",
    Limit = "LIMIT",
    Stop = "STOP",
    StopLimit = "STOPLIMIT",
}

enum NinjaTraderTif {
    Day = "DAY",
    GoodUntilCancelled = "GTC",
}

enum FileEvent {
    Modified = "modified",
}

enum OrderStatus {
    Filled = "FILLED",
    Initialized = "INITIALIZED",
    Submitted = "SUBMITTED",
    Accepted = "ACCEPTED",
    Working = "WORKING",
    ChangeSubmitted = "CHANGESUBMITTED",
    CancelPending = "CANCELPENDING",
    Cancelled = "CANCELLED",
    Rejected = "REJECTED",
    PartiallyFilled = "PARTIALLYFILLED",
    TriggerPending = "TRIGGERPENDING",
}

enum PositionStatus {
    Update = "UPDATE",
}

enum ConnectionStatus {
    Connected = "CONNECTED",
    Disconnected = "DISCONNECTED",
}

enum MarketPosition {
    Flat = "FLAT",
    Long = "LONG",
    Short = "SHORT",
}

enum NinjaTraderEvent {
    Connected = "connected",
    Disconnected = "disconnected",
}

export {
    NinjaTraderCommand,
    NinjaTraderAction,
    NinjaTraderOrderType,
    NinjaTraderTif,
    NinjaTraderEvent,
    FileEvent,
    OrderStatus,
    ConnectionStatus,
    MarketPosition,
    PositionStatus,
};
