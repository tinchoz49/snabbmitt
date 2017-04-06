const rememberVnode = require('./remember-vnode');
const htmldomapi = require('./htmldomapi');
const snabbdom = require('snabbdom');

module.exports = function createPatch(modules = []) {
    return snabbdom.init([
        ...modules,
        rememberVnode
    ], htmldomapi);
};
