const { _snabbmitt } = require('../symbols');
const copyRefs = require('./copy-refs');
const noop = () => {};
const hooks = [
    'pre',
    'init',
    'create',
    'insert',
    'prepatch',
    'update',
    'postpatch',
    'destroy',
    'remove',
    'post'
];

module.exports = function applyHook(vnode) {
    vnode.data.hook = vnode.data.hook || {};

    const componentHooks = {
        create(...args) {
            const vnode = args[args.length - 1];
            if (vnode.data[_snabbmitt]) {
                vnode.data[_snabbmitt].cvnode.elm = vnode.elm;
            }
        },
        postpatch(oldVnode, vnode) {
            if (oldVnode.data[_snabbmitt]) {
                const rvnode = oldVnode.data[_snabbmitt].rvnode;
                copyRefs(rvnode, vnode);
                vnode.data[_snabbmitt] = oldVnode.data[_snabbmitt];
            }
        }
    };

    for (const hook of hooks) {
        if (!vnode.data.hook[hook] && !componentHooks[hook]) {
            continue;
        }
        const cb = vnode.data.hook[hook] || noop;
        const componentCb = componentHooks[hook] || noop;
        vnode.data.hook[hook] = (...args) => {
            componentCb(...args);
            cb(...args);
        };
    }

    return vnode;
};
