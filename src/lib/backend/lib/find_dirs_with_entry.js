"use strict";

const fs = require("fs-extra-promise");
const path = require("path");
const log = require("log");

const findDirsWithEntry = async (baseDir, entryFile = "index.js") => {
    const res = [];
    const dirContent = await fs.readdirAsync(baseDir);
    for (const dirName of dirContent) {
        const dirPath = path.join(baseDir, dirName);
        const entryPath = path.join(dirPath, entryFile);
        try {
            fs.accessAsync(entryPath, fs.constants.R_OK);
            res.push({
                path: entryPath,
                name: dirName,
                dir: dirPath
            });
        } catch (error) {
            log.warn(`Path ${entryPath} isn't readable, skipping...`, error);
        }
    }

    return res;
};

module.exports = findDirsWithEntry;
