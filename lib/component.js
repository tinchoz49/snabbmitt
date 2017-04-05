const mitt = require('mitt');
const createRenderer = require('./create-renderer');
const noop = () => {};
const _snabbmitt = Symbol('snabbmitt');

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

function defineHooks(emitter, vnode) {
    vnode.data.hook = vnode.data.hook || {};

    const componentHooks = {
        create(...args) {
            const vnode = args[args.length - 1];
            if (vnode.data[_snabbmitt]) {
                vnode.data[_snabbmitt].cvnode.elm = vnode.elm;
            }
        },
        postpatch(oldVnode, vnode) {
            if (oldVnode.data[_snabbmitt] && vnode && vnode.elm.parentElement && vnode.elm.parentElement.vnode) {
                const rvnode = oldVnode.data[_snabbmitt].rvnode;
                const children = vnode.elm.parentElement.vnode.children;
                const pos = children.indexOf(rvnode);
                if (pos !== -1) {
                    children[pos] = vnode;
                }
                oldVnode.data[_snabbmitt].rvnode = vnode;
                vnode.data[_snabbmitt] = oldVnode.data[_snabbmitt];
            }
        }
    };

    for (const hook of hooks) {
        const cb = vnode.data.hook[hook] || noop;
        const componentCb = componentHooks[hook] || noop;
        vnode.data.hook[hook] = (...args) => {
            componentCb(...args);
            cb(...args);
            emitter.emit(hook, args);
        };
    }

    return vnode;
}

function instanceComponent(patch, container, factory, userProps = {}) {
    const render = createRenderer(patch, container);
    let props = userProps;
    let vnode;
    let userView;
    let store;
    const emitter = mitt();

    emitter.on('render', () => {
        vnode = render({ usePatch: true, view, state, props });
    });

    const instance = factory({ emitter, props });

    if (typeof instance === 'function') {
        userView = instance;
    } else {
        userView = instance.view;
        store = instance.store;
    }

    const view = ({ state, props }) => {
        return defineHooks(emitter, userView({ state, props }));
    };

    const state = typeof store === 'function' ? store() : {};
    if (typeof state !== 'object') throw new Error('Store function in your components should return an state object');

    return {
        vnode() {
            return vnode;
        },
        render({ usePatch = false, props: userProps = {} }) {
            props = userProps;
            vnode = render({ usePatch, view, state, props });
            return vnode;
        },
        state,
        props,
        emitter
    };
}

function copyToVnode(vnode, nextVnode) {
    vnode.elm = nextVnode.elm;
    vnode.data = nextVnode.data;
    vnode.children = nextVnode.children;
    vnode.text = nextVnode.text;
    vnode.sel = nextVnode.sel;
}

function component(patch, factory, props = {}) {
    if (!factory.sel) {
        factory.sel = 'component';
    }

    return {
        sel: factory.sel,
        key: props.key,
        data: {
            hook: {
                init(vnode) {
                    const instance = instanceComponent(patch, null, factory, props);
                    const cvnode = instance.render({ props });

                    if (factory.sel === 'component') {
                        // from now we know the indentity of this type of components
                        factory.sel = cvnode.sel;
                    }

                    cvnode.data[_snabbmitt] = {
                        instance,
                        factory,
                        cvnode,
                        rvnode: vnode
                    };
                    copyToVnode(vnode, cvnode);
                },
                prepatch(oldVnode, vnode) {
                    const cvnode = oldVnode.data[_snabbmitt].instance.render({ props });
                    cvnode.data[_snabbmitt] = oldVnode.data[_snabbmitt];
                    cvnode.data[_snabbmitt].rvnode = vnode;
                    cvnode.elm = oldVnode.elm;
                    copyToVnode(vnode, cvnode);
                }
            }
        }
    };
}

exports.defineHooks = defineHooks;
exports.instanceComponent = instanceComponent;
exports.component = component;
