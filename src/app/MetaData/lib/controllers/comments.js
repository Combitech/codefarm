"use strict";

const Comment = require("../types/comment");
const { Controller } = require("servicecom");

class Comments extends Controller {
    constructor() {
        super(Comment);
    }
}

module.exports = Comments;
