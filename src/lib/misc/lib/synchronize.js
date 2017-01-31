"use strict";

const synchronize = (obj, methodName) => {
    // Make sure the method name is correctly given
    if (!obj[methodName]) {
        throw new Error(`Can not synchronize, no method called ${methodName} found on supplied object`);
    }

    // Define a name that will be excluded from serialization, thus begin with __
    const lockName = `__lock_${methodName}`;

    // Make sure synchronize is not called more than once of each method
    if (obj[lockName]) {
        throw new Error(`Can not synchronize, ${methodName} has already been synchronized`);
    }

    // Create a local copy of our method and make sure it will get the correct this
    const method = obj[methodName].bind(obj);

    // Create the lock in an initial resolved state
    obj[lockName] = Promise.resolve();

    // Define the wrapper method with our synchronize pattern
    obj[methodName] = async (...args) => {
        // Create a new lock (promise) from the call to our method
        const newLock = obj[lockName].then(() => method(...args));

        // Re assign or lock to our newLock which will be resolved
        // after method above has completed. Though if method above
        // throws it should not affect our lock, the next call should
        // proceed as before.
        obj[lockName] = newLock.catch(() => {});

        // Return the newLock to be awaited on, if method throws
        // newLock will be rejected just as expected.
        return newLock;
    };
};

module.exports = synchronize;
