const mitt = require('mitt');
const applyHook = require('./hook');
const createRenderer = require('../patch/renderer');

module.exports = function instanceComponent(patch, container, factory, userProps = {}) {
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
        return applyHook(emitter, userView({ state, props }));
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
};
