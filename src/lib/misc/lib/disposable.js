"use strict";

class Disposable {
    constructor(disposeFunc) {
        this.dispose = disposeFunc;
    }

    static async disposeAll(list) {
        for (const disposable of list) {
            await Promise.resolve(disposable.dispose());
        }
    }
}

module.exports = Disposable;
