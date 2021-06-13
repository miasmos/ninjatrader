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

export { NinjaTraderCommand, NinjaTraderAction, NinjaTraderOrderType, NinjaTraderTif };
