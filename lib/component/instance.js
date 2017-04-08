const mitt = require('mitt');
const applyHook = require('./hook');
const createRenderer = require('../patch/renderer');

module.exports = function instanceComponent(patch, container, factory, userProps = {}) {
    const render = createRenderer(patch, container);
    let props = userProps;
    let children = [];
    let vnode;
    let userView;
    let store;
    const emitter = mitt();

    emitter.on('render', () => {
        vnode = render({ usePatch: true, view, state, props, children });
    });

    const instance = factory({ emitter, props });

    if (typeof instance === 'function') {
        userView = instance;
    } else {
        userView = instance.view;
        store = instance.store;
    }

    const view = ({ state, props, children }) => {
        return applyHook(userView({ state, props, children }));
    };

    const state = typeof store === 'function' ? store() : {};
    if (typeof state !== 'object') throw new Error('Store function in your components should return an state object');

    return {
        vnode() {
            return vnode;
        },
        render({ usePatch = false, props: userProps = {}, children: userChildren = [] }) {
            props = userProps;
            children = userChildren;
            vnode = render({ usePatch, view, state, props, children });
            return vnode;
        },
        state,
        props,
        emitter
    };
};
