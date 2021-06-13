# Ninjatrader ![npm](https://img.shields.io/npm/v/ninjatrader?style=flat-square)

A tiny js wrapper for the NinjaTrader 8 file api.

[Read NinjaTrader's documentation](https://ninjatrader.com/support/helpGuides/nt8/?functions.htm) for more information about how the file api works.

# Getting Started

`npm install ninjatrader`

or

`yarn add ninjatrader`

In NinjaTrader, enable automated trading by making sure `AT Interface` is checked under `Tools > Options > Automated Trading Interface`.

# Example

Initialize

```
import NinjaTrader from 'ninjatrader';

const nt = new NinjaTrader({
    account: "Sim101"
});
```

Place a market order

```
import { NinjaTraderAction, NinjaTraderTif, OrderStatus } from 'ninjatrader';

const order = await nt.market({
    action: NinjaTraderAction.Buy,
    quantity: 69,
    tif: NinjaTraderTif.Day,
    instrument: "AMC",
    onUpdate: (status: OrderStatus, state: OrderState) => {
        switch(status) {
            case OrderStatus.Rejected:
                // order rejected
                break;
            case OrderStatus.Filled:
                // order filled
                console.log(state); // { quantity: 69, price: 49.40 }
                break;
        }
    },
    onRejected: (state: OrderState) => {
        // order rejected
        console.log(state); // { quantity: 0, price: 0 }
    }
}); // order accepted after await

```

Place a limit order with a stop loss

```
import { NinjaTraderAction, NinjaTraderTif } from 'ninjatrader';

const order = await nt.limit({
    action: NinjaTraderAction.Buy,
    quantity: 69,
    tif: NinjaTraderTif.Day,
    instrument: "GME",
    limitPrice: 1000,
    stopPrice: 980
});

console.log(order); // { quantity: 69, price: 998.12 }
```

Cancel an order

```
import { NinjaTraderAction, NinjaTraderTif } from 'ninjatrader';

const orderId = "1"; // random unique id

nt.market({
    action: NinjaTraderAction.Buy,
    quantity: 69,
    tif: NinjaTraderTif.Day,
    instrument: "BTCUSD",
    orderId
});

nt.cancel({
    orderId
});
```

Update an order

```
import { NinjaTraderAction, NinjaTraderTif } from 'ninjatrader';

const orderId = "1"; // random unique id

nt.limit({
    action: NinjaTraderAction.Buy,
    quantity: 69,
    tif: NinjaTraderTif.Day,
    limitPrice: 17.21,
    stopPrice: 17.15,
    instrument: "BB",
    orderId
});

nt.change({
    quantity: 69,
    stopPrice: 17.19,
    orderId
});
```

Listen for connection status

```
nt.onConnected("Simulated Data Feed", () => {
    // simulated data feed connected
});

nt.onDisconnected("Simulated Data Feed", () => {
    // simulated data feed disconnected
});

nt.onConnection("Simulated Data Feed", (connected: boolean) => {
    console.log(connected); // true / false
})
```

Listen for position changes

```
nt.onPosition("ETHUSD", (position: PositionUpdateState) => {
    console.log(position); // { position: 'LONG', quantity: 4, price: 2336.46 }
});
```

License  
==========  
Copyright (c) 2021 Stephen Poole

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
