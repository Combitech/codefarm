
const utils = {
    createStateProperties(inst, properties, item) {
        for (const key of Object.keys(properties)) {
            if (key.includes("[")) {
                const [ , name, index, itemName ] = key.match(/(.*)\[(.*)\]\.(.*)/);
                const idx = parseInt(index, 10);

                let value = properties[key].defaultValue;

                if (item && item[name] && item[name][idx]) {
                    value = item[name][idx][itemName];
                }

                inst.addStateVariable(key, value);
            } else {
                inst.addStateVariable(key, item ? item[key] : properties[key].defaultValue);
            }
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

        const set = (data, key, value) => {
            if (key.includes("[")) {
                const [ , name, index, itemName ] = key.match(/(.*)\[(.*)\]\.(.*)/);
                const idx = parseInt(index, 10);

                data[name] = data[name] || [];
                data[name][idx] = data[name][idx] || {};
                data[name][idx][itemName] = value;
            } else {
                data[key] = value;
            }
        };

        if (item) {
            for (const key of Object.keys(properties)) {
                if (properties[key].editable) {
                    set(data, key, inst.state[key].value);
                }
            }

            data._id = item._id;
        } else {
            for (const key of Object.keys(properties)) {
                set(data, key, inst.state[key].value);
            }
        }

        return data;
    }
};

export default utils;
