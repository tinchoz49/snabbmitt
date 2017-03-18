module.exports = function createRenderer(patch, container) {
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
