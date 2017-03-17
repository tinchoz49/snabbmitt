const mitt = require('mitt');
const give = require('xet');
const curry = require('curry');
const DeepMap = require('./deepmap');
const createRenderer = require('./create-renderer');
const noop = () => {};
const instances = new DeepMap();

function defineHooks(emitter, vnode) {
    vnode.data.hook = vnode.data.hook || {};

    const userDestroy = vnode.data.hook.destroy || noop;
    const userPostpatch = vnode.data.hook.postpatch || noop;

    vnode.data.hook.destroy = vnode => {
        userDestroy(vnode);
        emitter.emit('self:destroy');
    };

    vnode.data.hook.postpatch = (oldVnode, vnode) => {
        if (vnode && vnode.elm.parentElement) {
            const children = vnode.elm.parentElement.vnode.children;
            children[children.indexOf(oldVnode)] = vnode;
            userPostpatch(oldVnode, vnode);
        }
    };

    vnode.data.emitter = emitter;

    return vnode;
}

function createComponent(factory, { props = {} }) {
    const render = createRenderer();

    const emitter = mitt();

    emitter.on('self:update', () => {
        render({ view, state, props });
    });

    const { view: userView, store } = factory({ emitter, component: component(emitter), props });

    const view = ({ state, props }) => {
        return defineHooks(emitter, userView({ state, props }));
    };

    const state = store();

    render({ view, state, props });

    return render;
}

const component = curry((emitter, factory, props) => {
    const keys = [emitter, factory, props.key];

    const instance = give.call(instances, keys, () => {
        const render = createComponent(factory, { props });
        const emitter = render.getVnode().data.emitter;

        emitter.on('self:destroy', () => {
            instances.delete(keys);
        });

        return render;
    });

    return instance.getVnode();
});

exports.defineHooks = defineHooks;
exports.createComponent = createComponent;
exports.component = component;
