
const utils = {
    createStateProperties(inst, properties, item) {
        for (const key of Object.keys(properties)) {
            let value = properties[key].defaultValue;
            if (key.includes("[")) {
                const [ , name, index, itemName ] = key.match(/(.*)\[(.*)\]\.(.*)/);
                const idx = parseInt(index, 10);

                if (item && item[name] && item[name][idx]) {
                    value = item[name][idx][itemName];
                }
            } else if (item) {
                value = item[key];
            }

            let deserializedValue = value;
            if (typeof properties[key].deserialize === "function") {
                deserializedValue = properties[key].deserialize(value);
            }

            inst.addStateVariable(key, deserializedValue);
        }
    },
    isValid(inst, properties) {
        for (const key of Object.keys(properties)) {
            if (properties[key].required()) {
                if (properties[key].defaultValue.constructor === Array &&
                    inst.state[key].value.length === 0) {
                    return false;
                } else if (properties[key].defaultValue.constructor === Number &&
                           isNaN(parseInt(inst.state[key].value, 10))) {
                    return false;
                } else if (properties[key].defaultValue.constructor === String &&
                           inst.state[key].value === "") {
                    return false;
                }
            }
        }

        return true;
    },
    serialize(inst, properties, item) {
        const data = {};

        const set = (data, key, value, serialize) => {
            let serializedValue = value;
            if (typeof serialize === "function") {
                serializedValue = serialize(serializedValue);
            }
            if (key.includes("[")) {
                const [ , name, index, itemName ] = key.match(/(.*)\[(.*)\]\.(.*)/);
                const idx = parseInt(index, 10);

                data[name] = data[name] || [];
                data[name][idx] = data[name][idx] || {};
                data[name][idx][itemName] = serializedValue;
            } else {
                data[key] = serializedValue;
            }
        };

        if (item) {
            for (const key of Object.keys(properties)) {
                if (properties[key].editable) {
                    set(data, key, inst.state[key].value, properties[key].serialize);
                }
            }

            data._id = item._id;
        } else {
            for (const key of Object.keys(properties)) {
                set(data, key, inst.state[key].value, properties[key].serialize);
            }
        }

        return data;
    },
    serializeRef(id, type, name) {
        return {
            _ref: true,
            id: id,
            type: type,
            name: name
        };
    },
    deserializeRef(ref) {
        return ref.id;
    }
};

export default utils;
