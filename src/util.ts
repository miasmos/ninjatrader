import EventEmitter from "events";

class Util {
    static eventAsync<T>(emitter: EventEmitter, event: string, timeout = 5000): Promise<T> {
        return Util.eventAnyAsync(emitter, [event], timeout);
    }

    static eventAnyAsync<T>(emitter: EventEmitter, events: string[], timeout = 5000): Promise<T> {
        return new Promise((resolve, reject) => {
            let wasResolved = false;

            const cleanup = () => events.map(event => emitter.off(event, callback));
            const interval = setTimeout(() => {
                if (!wasResolved) {
                    reject("Call timed out");
                    cleanup();
                    wasResolved = true;
                }
            }, timeout);
            const callback = (payload: T) => {
                if (!wasResolved) {
                    wasResolved = true;
                    clearTimeout(interval);
                    cleanup();
                    resolve.call(resolve, payload);
                    wasResolved = true;
                }
            };

            events.map(event => emitter.on(event, callback));
        });
    }
}

export default Util;
