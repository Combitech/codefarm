"use strict";

const event2string = (event, indent = 0, pad = 2) => JSON
    .stringify(event.content, null, pad)
    .split("\n")
    .map((line) => " ".repeat(indent) + line)
    .join("\n");

const getEvents = async (event, writtenIds, method, callback) => {
    const events = await event[method]();

    for (const event of events) {
        if (!writtenIds.includes(event._id)) {
            callback(event);
            writtenIds.push(event._id);
            await getEvents(event, writtenIds, method, callback);
        }
    }
};

const chain = async (stream, event, method) => {
    stream.write("[\n");
    stream.write(event2string(event, 2));

    await getEvents(event, [ event._id ], method, (event) => {
        stream.write(",\n");
        stream.write(event2string(event, 2));
    });

    stream.end("\n]");
};

module.exports = chain;
