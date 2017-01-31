"use strict";

const parser = require("boolean-parser");

class TagCriteria {
    constructor(criteria) {
        this.criteria = criteria;
        this.parsed = parser.parseBooleanQuery(criteria);
    }

    isValid() {
        return !!this.parsed;
    }

    match(tags) {
        for (const line of this.parsed) {
            const match = line.filter((tag) => {
                if (tag[0] === "!") {
                    return tags.includes(tag.slice(1));
                }

                return !tags.includes(tag);
            }).length === 0;

            if (match) {
                return true;
            }
        }

        return false;
    }
}

module.exports = TagCriteria;
