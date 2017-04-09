const { _snabbmitt } = require('../symbols');
const instanceComponent = require('./instance');
const copyRefs = require('./copy-refs');

module.exports = function component(patch, factory, props = {}, children = []) {
    if (!factory.sel) {
        factory.sel = 'component';
    }

    return {
        sel: factory.sel,
        key: props.key,
        data: {
            hook: {
                init(vnode) {
                    const instance = instanceComponent(patch, null, factory, props);
                    const cvnode = instance.render({ props, children });

                    if (factory.sel === 'component') {
                        // from now we know the indentity of this type of components
                        factory.sel = cvnode.sel;
                    }

                    cvnode.data[_snabbmitt] = {
                        instance,
                        factory,
                        cvnode,
                        rvnode: vnode
                    };
                    copyRefs(vnode, cvnode);
                },
                prepatch(oldVnode, vnode) {
                    const cvnode = oldVnode.data[_snabbmitt].instance.render({ props, children });
                    cvnode.data[_snabbmitt] = oldVnode.data[_snabbmitt];
                    cvnode.data[_snabbmitt].rvnode = vnode;
                    cvnode.elm = oldVnode.elm;
                    copyRefs(vnode, cvnode);
                }
            }
        }
    };
};
