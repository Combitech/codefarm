
import routes from "./routes";
import { ensureArray } from "misc";

/** Find first route with a given propName that matches typeName
 * @param {String} typeName Type name
 * @param {String} [propName] Name of property
 * @param {String} prefix Enforce path must begin with
 * @return {Array} Array of paths up to and including target route
 */
const findPath = (typeName, propName, prefix = false) => {
    const visit = (node, parentPath) => {
        let myPath = parentPath;
        if (!node) {
            return false;
        }

        if (node.props && node.props.path) {
            const myPathItem = node.props.path === "/" ? "" : node.props.path;
            myPath = [ ...parentPath, myPathItem ];

            if (node.props.type === typeName && node.props.hasOwnProperty(propName)) {
                return myPath;
            }
        }

        // Recursively iterate through childrens until first child path matches
        const childs = (node instanceof Array) ? node : ensureArray(node.props.children);
        for (const child of childs) {
            const childPath = visit(child, myPath, prefix);

            if (childPath && (!prefix || childPath[1] === prefix)) {
                return childPath;
            }
        }

        return false;
    };

    return visit(routes, [], prefix);
};

/** Replace all path items starting with : with matching prop in item
 * Example:
 *   fillTemplatePath([ "first", ":id" ], { id: 10 })
 * Returns:
 *   [ "first", 10 ]
 * @param {Array} templatePath Array of template path items
 * @param {Object} item Item to lookup properties in
 * @param {object} idMap Translation object for ids
 * @return {Array} Path with templates resolved
 */
const fillTemplatePath = (templatePath, item, idMap) => templatePath.map((pathItem) => {
    if (!pathItem.startsWith(":")) {
        return pathItem;
    }

    const name = pathItem.slice(1);
    const key = idMap[name] || name;

    return item[key];
});

const pathFromArray = (arr) => arr.join("/");

/** Build path from typeName and type object
 * Examples:
 * fromType("exec.slave", obj) returns "/admin/slaves/${obj._id}"
 * fromType("coderepo.rev", obj) returns "/code/${obj.repository}/${obj._id}"
 * fromType("exec.slave", obj, [ "slaveId" ]) returns "/admin/slaves/${obj.slaveId}"
 * @param {String} typeName Typename in format "service.type"
 * @param {Object} item Instance to extract properties from
 * @param {Object} [opts] Options
 * @param {Boolean} [opts.debug] Debug enabled. Default is false.
 * @return {String} Pathname
 */
const fromType = (typeName, item, opts = {}) => {
    opts = Object.assign({
        debug: false,
        idMap: {},
        prefix: false
    }, opts);

    const templatePath = findPath(typeName, "Item", opts.prefix);
    const path = fillTemplatePath(templatePath, item, opts.idMap);
    const pathStr = pathFromArray(path);

    opts.debug && console.log(`pathBuilder.fromType: ${typeName} -> ${pathFromArray(templatePath)} -> ${pathStr}`);

    return pathStr;
};

export {
    fromType
};
