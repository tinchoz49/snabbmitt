module.exports = function copyRefs(vnode, nextvnode) {
    vnode.elm = nextvnode.elm;
    vnode.data = nextvnode.data;
    vnode.children = nextvnode.children;
    vnode.text = nextvnode.text;
    vnode.sel = nextvnode.sel;
};
