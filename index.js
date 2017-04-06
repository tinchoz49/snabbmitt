const { instanceComponent, component } = require('./lib/component');
const createPatch = require('./lib/patch');
let defaultPatch;

function snabbmitt(opts) {
    let patch;

    if (typeof opts === 'function') {
        patch = opts;
    } else if (!opts && defaultPatch) {
        patch = defaultPatch;
    } else {
        patch = createPatch(opts);
    }

    if (!defaultPatch) {
        defaultPatch = patch;
    }

    return {
        run(container, factory, props = {}) {
            const instance = instanceComponent(patch, container, factory, props);
            return instance.render({ usePatch: true, props });
        },
        component(factory, props = {}) {
            return component(patch, factory, props);
        }
    };
}

exports.component = function (factory, props = {}) {
    return component(defaultPatch, factory, props);
};
exports.snabbmitt = snabbmitt;
