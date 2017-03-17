const snabbdom = require('snabbdom');
const patch = snabbdom.init([
    require('snabbdom/modules/eventlisteners').default,
    require('snabbdom/modules/style').default,
    require('./remember-vnode')
], require('./htmldomapi'));

module.exports = function createRenderer(container) {
    let vnode = container;

    function render({ view, state, props }) {
        if (vnode) {
            vnode = patch(vnode, view({ state, props }));
        } else {
            vnode = view({ state, props });
        }

        return vnode;
    }

    render.getVnode = () => {
        return vnode;
    };

    return render;
};
