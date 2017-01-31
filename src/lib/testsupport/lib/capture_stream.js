"use strict";

/** Captures a stream to a buffer
 * To access the capture-buffer call method captured() on returned object.
 * @note Remember to call unhook() on returned object when done capturing.
 * @param {Object} stream Stream to capture
 * @return {Object} capture handle
 */
module.exports = (stream) => {
    const parentWrite = stream.write;
    let buf = "";

    stream.write = (chunk, encoding, callback) => {
        buf += chunk.toString(); // chunk is a String or Buffer
        parentWrite.apply(stream, arguments);
        // TODO: Check if callback shall be called at all here, isn't the write calling it...?
        callback();
    };

    return {
        unhook: () => stream.write = parentWrite,
        captured: () => buf,
        capturedLines: () => {
            // Remove any trailing \n in order to split into correct number of lines
            let tmpBuf = buf;

            if (tmpBuf[tmpBuf.length - 1] === "\n") {
                tmpBuf = buf.slice(0, -1);
            }

            return tmpBuf.split("\n");
        }
    };
};
