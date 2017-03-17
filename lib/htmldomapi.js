const htmldomapi = require('snabbdom/htmldomapi').default;
const removeChild = htmldomapi.removeChild;

htmldomapi.removeChild = (node, child) => {
    if (node && child) {
        removeChild(node, child);
    }
};

module.exports = htmldomapi;
