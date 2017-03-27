module.exports = function createRenderer(patch, container) {
    let vnode = container;

    function render({ noPatch, view, state, props }) {
        if (!noPatch && vnode && (vnode.elm || vnode.data === undefined)) {
            vnode = patch(vnode, view({ state, props }));
        } else {
            vnode = view({ state, props });
        }

        return vnode;
    }

    return render;
};
