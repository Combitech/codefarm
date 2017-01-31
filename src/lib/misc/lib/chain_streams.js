"use strict";

/** Chain the streams given as arguments together using pipes
 * The first stream will be piped to the second, the second to
 * the third and so forth. The last stream in the pipe-chain is
 * returned.
 * Example:
 * let s4 = chain(s1, s2, s3);
 * is equivalent to
 * let s4 = s1.pipe(s2).pipe(s3);
 * @param {Stream} streams Streams to connect
 * @return {Stream} Last stream in pipe-chain
 */
module.exports = (...streams) => {
    for (let i = 1; i < streams.length; i++) {
        streams[i - 1].pipe(streams[i]);
    }

    return streams[streams.length - 1];
};
