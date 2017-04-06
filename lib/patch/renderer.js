module.exports = function createRenderer(patch, container) {
    let vnode = container;

    function render({ usePatch, view, state, props }) {
        if (usePatch && vnode && (vnode.elm || vnode.parentNode)) {
            vnode = patch(vnode, view({ state, props }));
        } else {
            vnode = view({ state, props });
        }

        return vnode;
    }

    return render;
};
