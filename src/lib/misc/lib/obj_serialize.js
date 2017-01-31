"use strict";

const assertType = require("./assert_type");
const flatten = require("flat");
const traverse = require("traverse");

/*
const flattenObj = (parentKey, value, out, parts = [], joinKeyParts) => {
    if (value instanceof Object) {
        for (const [ k, v ] of Object.entries(value)) {
            const parts1 = parts.slice();
            if (parentKey) {
                parts1.push(parentKey);
            }

            flattenObj(k, v, out, parts1, joinKeyParts);
        }
    } else if (parentKey) {
        parts.push(parentKey);
        const varName = joinKeyParts(parts);
        out[varName] = value;
    } else {
        out = value;
    }
};
*/

const keyFormatters = {
    none: (key) => key,
    addPrefix: (key, opts) => {
        let prefix = "";
        if (opts.prefix) {
            prefix = `${opts.prefix}${opts.delimiter}`;
        }

        return `${prefix}${key}`;
    },
    addPrefixConvUpperCase: (key, opts) =>
        keyFormatters.addPrefix(key, opts).toUpperCase()
};

const annotate = (obj, opts) => {
    const prefix = opts.delimiter || "";
    const lengthSuffix = `${prefix}${opts.arrayLengthSuffix}`;

    return traverse(obj).forEach(/* @this */ function (n) { // eslint-disable-line prefer-arrow-callback
        if (this.circular) {
            this.remove();
        } else if (n instanceof Array) {
            if (this.parent) {
                const key = `${this.key}${lengthSuffix}`;
                const newParent = this.parent.node;
                newParent[key] = n.length;
                this.parent.update(newParent);
            }
        }
    });
};

class ObjSerialize {
    /** Flattens an object and formats keys
     * @param {Object} obj Object to flatten
     * @param {Object} opts Options
     * @param {String} opts.delimiter String to use to delimit words
     * @param {String} opts.prefix Optional prefix to prepend to each key in flattened object
     * @param {Number} opts.maxDepth Max number of nested objects to flatten
     * @param {Function} opts.keyFormatter Function taking key and opts as arguments returning formated key
     * @param {Boolean} opts.annotateArrays If true, add extra paramenter _length on same level as array indicies
     * @param {String} opts.arrayLengthSuffix Array length suffix to use when annotating arrays with length
     * @return {Object} Flat object
     */
    static flatten(obj, opts) {
        assertType(obj, "obj", "object");
        opts = opts || {};
        opts.delimiter = opts.delimiter || "_";
        opts.prefix = opts.prefix || false;
        opts.keyFormatter = opts.keyFormatter || keyFormatters.none;
        opts.annotateArrays = opts.annotateArrays || false;
        opts.arrayLengthSuffix = opts.arrayLengthSuffix || "length";
        let annotatedObj = obj;
        if (opts.annotateArrays) {
            annotatedObj = annotate(obj, opts);
        }
        const flatObj = flatten(annotatedObj, { delimiter: opts.delimiter, maxDepth: opts.maxDepth });
        const env = {};
        for (const [ k, v ] of Object.entries(flatObj)) {
            env[opts.keyFormatter(k, opts)] = v;
        }

        return env;
    }

    static get keyFormatters() {
        return keyFormatters;
    }
}

module.exports = ObjSerialize;
