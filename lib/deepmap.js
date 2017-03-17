const give = require('xet');
const root = new WeakMap();
const leaves = new Map();

const deepClear = deepMap => {
    if (leaves.has(deepMap)) {
        leaves.delete(deepMap);
    }

    for (let map of deepMap.values()) {
        deepClear(map);
    }

    return deepMap.clear();
};

module.exports = class DeepMap {
    constructor(entries = []) {
        for (let entry of entries) {
            this.set(...entry);
        }

        root.set(this, new Map());
    }

    clear() {
        return deepClear(this);
    }

    delete(keys) {
        let branch = root.get(this);

        for (let key of keys) {
            if (branch.has(key)) {
                branch = branch.get(key);
            } else {
                return false;
            }
        }

        return leaves.delete(branch);
    }

    has(keys) {
        let branch = root.get(this);

        for (let key of keys) {
            if (branch.has(key)) {
                branch = branch.get(key);
            } else {
                return false;
            }
        }

        return leaves.has(branch);
    }

    get(keys) {
        let branch = root.get(this);

        for (let key of keys) {
            branch = branch.get(key);
        }

        return leaves.get(branch);
    }

    set(keys, value) {
        let branch = root.get(this);

        for (let key of keys) {
            branch = give.call(branch, key, () => new Map());
        }

        leaves.set(branch, value);

        return this;
    }
};
