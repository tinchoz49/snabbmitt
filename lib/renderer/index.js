module.exports = function createRenderer(patch, container) {
    let vnode = container;

    function render({ usePatch, view, state, props, children }) {
        if (usePatch && vnode && (vnode.elm || vnode.parentNode)) {
            vnode = patch(vnode, view({ state, props, children }));
        } else {
            vnode = view({ state, props, children });
        }

        return vnode;
    }

    return render;
};
