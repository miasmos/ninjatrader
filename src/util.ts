import EventEmitter from "events";

class Util {
    static eventAsync<T>(emitter: EventEmitter, event: string, timeout = 5000): Promise<T> {
        return Util.eventAnyAsync(emitter, [event], timeout);
    }

    static eventAnyAsync<T>(emitter: EventEmitter, events: string[], timeout = 5000): Promise<T> {
        return new Promise((resolve, reject) => {
            let wasResolved = false;
            let cleanup = (): void => {
                /* noop */
            };
            const interval = setTimeout(() => {
                if (!wasResolved) {
                    reject(new Error("Call timed out"));
                    cleanup();
                    wasResolved = true;
                }
            }, timeout);
            const callback = (payload: T): void => {
                if (!wasResolved) {
                    wasResolved = true;
                    clearTimeout(interval);
                    cleanup();
                    resolve.call(resolve, payload);
                    wasResolved = true;
                }
            };
            cleanup = (): EventEmitter[] => events.map(event => emitter.off(event, callback));

            events.map(event => emitter.on(event, callback));
        });
    }
}

export default Util;
