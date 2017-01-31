"use strict";

class StringUtil {
    /** Takes string and a character index and returns
     * the same string but with the character at index
     * transformed to upper-case.
     * @param {String} str String to transform
     * @param {Number} charIndex Character to transform to upper-case
     * @return {String} Transformed string
     */
    static toUpperCaseLetter(str, charIndex = 0) {
        const newChar = str.charAt(charIndex).toUpperCase();
        const before = str.slice(0, charIndex);
        const after = str.slice(charIndex + 1);

        return `${before}${newChar}${after}`;
    }
}

module.exports = StringUtil;
