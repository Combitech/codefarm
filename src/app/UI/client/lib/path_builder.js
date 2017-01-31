import routes from "./routes";
import { ensureArray } from "misc";

/** Find first route with a given propName that matches typeName
 * @param {String} typeName Type name
 * @param {String} [propName] Name of property
 * @return {Array} Array of paths up to and including target route
 */
const findPath = (typeName, propName = "Item") => {
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
            const childPath = visit(child, myPath);
            if (childPath) {
                return childPath;
            }
        }

        return false;
    };

    return visit(routes, []);
};

/** Replace all path items starting with : with matching prop in item
 * Example:
 *   fillTemplatePath([ "first", ":id" ], { id: 10 })
 * Returns:
 *   [ "first", 10 ]
 * @param {Array} templatePath Array of template path items
 * @param {Object} item Item to lookup properties in
 * @return {Array} Path with templates resolved
 */
const fillTemplatePath = (templatePath, item) => templatePath.map((pathItem) =>
    pathItem.startsWith(":") ? item[pathItem.slice(1)] : pathItem
);

const pathFromArray = (arr) => arr.join("/");

/** Build path from typeName and type object
 * Examples:
 * fromType("exec.slave", obj) returns "/admin/slaves/${obj._id}"
 * fromType("coderepo.rev", obj) returns "/code/${obj.repository}/${obj._id}"
 * fromType("exec.slave", obj, [ "slaveId" ]) returns "/admin/slaves/${obj.slaveId}"
 * @param {String} typeName Typename in format "service.type"
 * @param {Object} item Instance to extract properties from
 * @return {String} Pathname
 */
const fromType = (typeName, item) => {
    const templatePath = findPath(typeName);
    const path = fillTemplatePath(templatePath, item);
    const pathStr = pathFromArray(path);
    console.log(`pathBuilder.fromType: ${typeName} -> ${pathFromArray(templatePath)} -> ${pathStr}`);

    return pathStr;
};

export {
    fromType
};
