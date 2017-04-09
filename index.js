const { instanceComponent, component } = require('./lib/component');
let defaultPatch;

function defineArgs(args) {
    let props = {};
    let children = [];

    if (args.length === 2) {
        [ props, children ] = args;
    } else if (args.length === 1) {
        if (Array.isArray(args[0])) {
            children = args[0];
        } else {
            props = args[0];
        }
    }

    return [ props, children ];
}

function snabbmitt(...args) {
    let patch;

    if (typeof args[0] === 'function') {
        patch = args[0];
    } else if (args.length === 0 && defaultPatch) {
        patch = defaultPatch;
    } else {
        const snabbdom = require('snabbdom');
        if (args.length === 0) {
            patch = snabbdom.init([]);
        } else {
            patch = snabbdom.init(...args);
        }
    }

    if (!defaultPatch) {
        defaultPatch = patch;
    }

    return {
        run(container, factory, props = {}) {
            const instance = instanceComponent(patch, container, factory, props);
            return instance.render({ usePatch: true, props });
        },
        component(factory, ...args) {
            return component(patch, factory, ...defineArgs(args));
        }
    };
}

exports.component = function (factory, ...args) {
    return component(defaultPatch, factory, ...defineArgs(args));
};

exports.snabbmitt = snabbmitt;
