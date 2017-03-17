module.exports = {
    create(oldVnode, vnode) {
        vnode.elm.vnode = vnode;
    },
    update(oldVnode, vnode) {
        vnode.elm.vnode = vnode;
    }
};
