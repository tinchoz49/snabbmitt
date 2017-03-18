const { createComponent } = require('./lib/component');

function createPatch(modules = []) {
    const snabbdom = require('snabbdom');
    return snabbdom.init([
        ...modules,
        require('./lib/remember-vnode')
    ], require('./lib/htmldomapi'));
}

function snabbmitt(opts) {
    let patch;
    if (typeof opts === 'function') {
        patch = opts;
    } else {
        patch = createPatch(opts);
    }

    return {
        start(container, factory, props = {}) {
            return createComponent({ patch, container, factory, props });
        }
    };
}

module.exports = snabbmitt;
