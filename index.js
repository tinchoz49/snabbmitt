const mitt = require('mitt');
const createRenderer = require('./lib/create-renderer');
const { component } = require('./lib/component');

function start(container, createApp, props = {}) {
    const render = createRenderer(container);

    const emitter = mitt();

    emitter.on('self:update', () => {
        render({ view, state, props });
    });

    const { view, store } = createApp({ emitter, component: component(emitter), props });

    const state = store();

    emitter.emit('self:update');

    return emitter;
}

exports.start = start;
