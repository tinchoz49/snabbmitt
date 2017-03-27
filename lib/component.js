const mitt = require('mitt');
const h = require('snabbdom/h').default;
const createRenderer = require('./create-renderer');
const noop = () => {};
const _snabbmitt = Symbol('snabbmitt');

function defineHooks(emitter, vnode) {
    vnode.data.hook = vnode.data.hook || {};

    const userCreate = vnode.data.hook.create || noop;
    const userPostpatch = vnode.data.hook.postpatch || noop;

    vnode.data.hook.create = (...args) => {
        const vnode = args[args.length - 1];
        if (vnode.data[_snabbmitt]) {
            vnode.data[_snabbmitt].cvnode.elm = vnode.elm;
        }
        userCreate(...args);
    };

    vnode.data.hook.postpatch = (oldVnode, vnode) => {
        if (oldVnode.data[_snabbmitt] && vnode && vnode.elm.parentElement && vnode.elm.parentElement.vnode) {
            const rvnode = oldVnode.data[_snabbmitt].rvnode;
            const children = vnode.elm.parentElement.vnode.children;
            const pos = children.indexOf(rvnode);
            if (pos !== -1) {
                children[pos] = vnode;
            }
            oldVnode.data[_snabbmitt].rvnode = vnode;
            vnode.data[_snabbmitt] = oldVnode.data[_snabbmitt];
            userPostpatch(oldVnode, vnode);
        }
    };

    return vnode;
}

function instanceComponent(patch, container, factory, userProps = {}) {
    const render = createRenderer(patch, container);
    let props = userProps;
    let vnode;
    const emitter = mitt();

    emitter.on('self:update', () => {
        vnode = render({ usePatch: true, view, state, props });
    });

    const { view: userView, store } = factory({ emitter, props });

    const view = ({ state, props }) => {
        return defineHooks(emitter, userView({ state, props }));
    };

    const state = typeof store === 'function' ? store() : {};

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
        const instance = instanceComponent(patch, null, factory, props);
        const cvnode = instance.render({ props });
        factory.sel = cvnode.sel;
        return h('component', {
            key: props.key,
            hook: {
                init(vnode) {
                    cvnode.data[_snabbmitt] = {
                        instance,
                        factory,
                        cvnode,
                        rvnode: vnode
                    };
                    copyToVnode(vnode, cvnode);
                }
            }
        });
    }

    return h(factory.sel, {
        key: props.key,
        hook: {
            init(vnode) {
                const instance = instanceComponent(patch, null, factory, props);
                const cvnode = instance.render({ props });
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
    });
}

exports.defineHooks = defineHooks;
exports.instanceComponent = instanceComponent;
exports.component = component;
